const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Cấu hình số lượng chapter muốn tải (Để Infinity nếu muốn tải HẾT SẠCH truyện tự động)
const MAX_CHAPTERS_TO_DOWNLOAD = 2; 

// Tách slug truyện thông minh từ URL trang chi tiết
function parseMangaSlug(url) {
    try {
        const cleanUrl = url.replace(/\/$/, "");
        const parts = cleanUrl.split('/');
        const lastPart = parts[parts.length - 1].replace('.html', '');
        
        if (lastPart.includes('-chap-')) {
            const index = lastPart.indexOf('-chap-');
            return lastPart.substring(0, index);
        }
        return lastPart;
    } catch (e) {
        return 'unknown-comic';
    }
}

async function autoCrawlAndDownload(mangaDetailUrl) {
    console.log(`🚀 KHỞI ĐỘNG CÔNG NGHỆ CHẶN BẮT ĐƯỜNG TRUYỀN MẠNG (NETWORK INTERCEPTION)...`);
    
    const browser = await puppeteer.launch({ 
        headless: false, // Để false để quan sát quá trình chạy và giải mã của Chrome
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
    });
    
    const page = await browser.newPage();
    // Kích hoạt Retina để ép CDN nhả file ảnh to và nét nhất có thể
    await page.setViewport({ width: 1200, height: 900, deviceScaleFactor: 2 }); 
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // 🔥 Kích hoạt tính năng cache của trình duyệt để đảm bảo ảnh load mượt và đủ dữ liệu
    await page.setCacheEnabled(true);

    try {
        // ==========================================
        // BƯỚC 1: QUÉT TRANG CHI TIẾT LẤY DANH SÁCH CHAPTER
        // ==========================================
        console.log(`🔍 Phân tích danh sách chương từ: ${mangaDetailUrl}`);
        await page.goto(mangaDetailUrl, { waitUntil: 'networkidle2', timeout: 90000 });

        const mangaData = await page.evaluate(() => {
            const title = document.querySelector('.title-manga, h1, .name-manga')?.textContent?.trim() || 'Truyen Tranh';
            const allLinks = document.querySelectorAll('a');
            const chapters = [];

            allLinks.forEach((element) => {
                const url = element.href;
                const name = element.textContent?.trim() || '';
                if (!url) return;

                const isChapterUrl = url.includes('-chap-') || url.includes('/chap-') || url.includes('chapter-');
                const hasChapterContext = element.closest('.works-chapter-list') || 
                                          element.closest('.list-chapter') || 
                                          element.closest('#nt_listchapter') || 
                                          element.closest('.chapter-list') ||
                                          element.closest('.box-list-chapter') ||
                                          name.toLowerCase().includes('chap') ||
                                          name.toLowerCase().includes('chương');

                if (isChapterUrl && hasChapterContext) {
                    if (!chapters.some((chapter) => chapter.url === url)) {
                        chapters.push({ url, name });
                    }
                }
            });
            return { title, chapters: chapters.reverse() };
        });

        const comicSlug = parseMangaSlug(mangaDetailUrl);
        console.log(`📦 Bộ truyện: [ ${mangaData.title} ] - Tìm thấy ${mangaData.chapters.length} chương.`);

        if (mangaData.chapters.length === 0) {
            console.log('❌ Thất bại! Không tìm thấy danh sách chapter nào.');
            return;
        }

        const totalChaptersToDownload = Math.min(MAX_CHAPTERS_TO_DOWNLOAD, mangaData.chapters.length);

        // ==========================================
        // BƯỚC 2: VÒNG LẶP ĐI VÀO TỪNG CHAPTER ĐỂ "BẮT SỐNG" ẢNH MẠNG
        // ==========================================
        for (let i = 0; i < totalChaptersToDownload; i++) {
            const currentChapter = mangaData.chapters[i];
            
            // Làm sạch tên folder của chapter để tránh dính lỗi ký tự đặc biệt
            const cleanChapterFolder = currentChapter.name.replace(/[^a-zA-Z0-9 ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔƠƯưăâêôơư]/g, '-').trim();

            console.log(`\n--------------------------------------------------`);
            console.log(`⏳ Đang mở cổng mạng đánh chặn Chapter: ${currentChapter.name}`);

            // Khởi tạo thư mục vật lý lưu truyện trên máy tính của bạn
            const outputFolder = path.join(__dirname, 'manga-storage', comicSlug, cleanChapterFolder);
            if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder, { recursive: true });

            // 🔥 MẤU CHỐT: Đặt bẫy lắng nghe mọi gói tin Response chạy qua trình duyệt Chrome
            const downloadedUrls = new Set();
            let imageCounter = 1;

            const onResponseHandler = async (response) => {
                const url = response.url();
                const lowerUrl = url.toLowerCase();
                
                // Bộ lọc nhận diện chính xác link ảnh truyện từ CDN (ĐÃ SỬA LỖI lowerSrc)
                const isMangaReal = lowerUrl.includes('cdn') || lowerUrl.includes('storage') || lowerUrl.includes('upload') || lowerUrl.includes('truyenvua') || lowerUrl.includes('nettruyen') || /\/\d+\/\d+\/\d+\./i.test(lowerUrl);
                
                const isNoise = lowerUrl.includes('avatar') || lowerUrl.includes('logo') || lowerUrl.includes('banner') || lowerUrl.includes('thumb') || lowerUrl.includes('cover') || lowerUrl.includes('zone') || lowerUrl.includes('credit') || lowerUrl.includes('sticker') || lowerUrl.endsWith('.gif');

                if (isMangaReal && !isNoise && !downloadedUrls.has(url)) {
                    // Kiểm tra xem gói tin trả về có phải là định dạng hình ảnh hay không
                    const headers = response.headers();
                    const contentType = headers['content-type'] || '';
                    
                    if (contentType.startsWith('image/') || lowerUrl.includes('.jpg') || lowerUrl.includes('.webp') || lowerUrl.includes('.png') || lowerUrl.includes('.avif')) {
                        downloadedUrls.add(url);
                        
                        try {
                            // Tự động nhận diện đuôi file thật từ Header phản hồi mạng hệ thống
                            let ext = '.jpg';
                            if (contentType.includes('webp') || lowerUrl.includes('.webp')) ext = '.webp';
                            else if (contentType.includes('png') || lowerUrl.includes('.png')) ext = '.png';
                            else if (contentType.includes('avif') || lowerUrl.includes('.avif')) ext = '.avif';

                            // "Hứng" trọn vẹn Buffer nhị phân thô của file ảnh gốc từ luồng mạng
                            const buffer = await response.buffer();
                            
                            const fileName = `page_${String(imageCounter++).padStart(3, '0')}${ext}`;
                            const localPath = path.resolve(outputFolder, fileName);
                            
                            fs.writeFileSync(localPath, buffer);
                            console.log(`💾 [NETWORK CAPTURE] Đã tóm gọn file gốc: ${fileName}`);
                        } catch (e) {
                            // Bỏ qua lỗi nếu gói tin phản hồi bị ngắt quãng
                        }
                    }
                }
            };

            // Bật bộ lắng nghe mạng
            page.on('response', onResponseHandler);

            // Điều hướng tới trang đọc truyện
            await page.goto(currentChapter.url, { waitUntil: 'networkidle2', timeout: 90000 });
            await page.evaluate(() => new Promise((resolve) => window.setTimeout(resolve, 2000)));

            console.log("⬇️  Đang cuộn chuột thật chậm để ép Chrome kích hoạt tải dữ liệu ảnh gốc...");
            // Cuộn chuột mịn để kích hoạt gói tin mạng đổ về
            await page.evaluate(async () => {
                await new Promise((resolve) => {
                    let totalHeight = 0;
                    const distance = 150; 
                    const timer = window.setInterval(() => {
                        const scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;
                        if (totalHeight >= scrollHeight) {
                            window.clearInterval(timer);
                            resolve();
                        }
                    }, 300); // Tốc độ cuộn chuẩn mắt người đọc truyện
                });
            });

            // Đợi thêm 5 giây cuối cùng cho các gói tin hình ảnh cuối trang tải về nốt
            await page.evaluate(() => new Promise((resolve) => window.setTimeout(resolve, 5000)));

            // Tắt bộ lắng nghe mạng của chapter này để giải phóng RAM và reset Counter trước khi sang chapter mới
            page.off('response', onResponseHandler);

            console.log(`✅ Hoàn thành đánh chặn và tải xong: ${currentChapter.name}`);
        }

        console.log(`\n🎉🎉🎉 TUYỆT VỜI! Toàn bộ ảnh gốc nguyên bản, chuẩn định dạng CDN đã được bóc tách thành công.`);

    } catch (error) {
        console.error('❌ Lỗi hệ thống:', error.message);
    } finally {
        await browser.close();
    }
}

// Đường link truyện bạn muốn tải
const targetMangaUrl = "https://truyenggvn.com/truyen-tranh/chu-thien-ky-4127"; 
autoCrawlAndDownload(targetMangaUrl);
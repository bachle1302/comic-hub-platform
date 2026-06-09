require('dotenv').config();

const puppeteer = require('puppeteer');
const { v2: cloudinary } = require('cloudinary');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const MAX_CHAPTERS_TO_DOWNLOAD = 7;

const targetUrl = 'https://truyenggvn.com/truyen-tranh/trong-sinh-do-thi-tu-tien-5492';

// Nếu muốn map vào truyện có sẵn trong DB thì sửa 2 dòng này
const COMIC_SLUG_IN_DB = 'trong-sinh-do-thi-tu-tien';

// Nếu chỉ muốn crawl 10 chương mới nhất thì để true
const ONLY_LAST_CHAPTERS = true;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cleanDirName = (name) =>
  name
    .replace(/[^a-zA-Z0-9 \u00C0-\u024F\u1E00-\u1EFF.-]/g, '')
    .trim();

const normalizeChapterNumber = (chapterName) => {
  const match = chapterName.match(/(?:chap|chapter|chương)\s*([\d.]+)/i);
  if (match) return match[1];

  const numberOnly = chapterName.match(/([\d.]+)/);
  if (numberOnly) return numberOnly[1];

  return cleanDirName(chapterName).replace(/\s+/g, '-').toLowerCase();
};

// Trích xuất thư mục gốc để gom nhóm ảnh
const getDirName = (urlStr) => {
  try {
    const urlObj = new URL(urlStr.startsWith('//') ? 'https:' + urlStr : urlStr);
    const pathname = urlObj.pathname;
    return pathname.substring(0, pathname.lastIndexOf('/'));
  } catch {
    return urlStr;
  }
};

const uploadBufferToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: options.folder,
        public_id: options.publicId,
        overwrite: true,
        invalidate: true,
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      },
    );

    stream.end(buffer);
  });
};

const findOrCreateChapter = async ({ comicId, chapterName, chapterNumber }) => {
  const parsedNum = parseFloat(chapterNumber);
  return prisma.chapter.upsert({
    where: {
      comicId_chapterNumber: {
        comicId,
        chapterNumber: parsedNum,
      },
    },
    update: {
      name: chapterName,
    },
    create: {
      comicId,
      chapterNumber: parsedNum,
      name: chapterName,
    },
  });
};

const saveImageToDb = async ({ chapterId, order, url, key, width, height, size, mimeType }) => {
  return prisma.chapterImage.upsert({
    where: {
      chapterId_order: {
        chapterId,
        order,
      },
    },
    update: {
      url,
      key,
      width,
      height,
      size,
      mimeType,
    },
    create: {
      chapterId,
      order,
      url,
      key,
      width,
      height,
      size,
      mimeType,
    },
  });
};

async function autoCrawlUploadAndSave(mangaUrl) {
  console.log(`🚀 Bắt đầu cào dữ liệu: ${mangaUrl}`);

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Thiếu CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET trong .env');
  }

  const comic = await prisma.comic.findUnique({
    where: {
      slug: COMIC_SLUG_IN_DB,
    },
  });

  if (!comic) {
    throw new Error(`Không tìm thấy comic trong DB với slug: ${COMIC_SLUG_IN_DB}`);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  await page.setViewport({ width: 1280, height: 900 });
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  );
  await page.setCacheEnabled(false);

  try {
    await page.goto(mangaUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    const mangaData = await page.evaluate(() => {
      const title =
        document.querySelector('h1, .title-manga, .name-manga')?.textContent?.trim() ||
        'Truyen_An_Danh';

      const allLinks = document.querySelectorAll('a');
      const chapters = [];
      const urlSet = new Set();

      allLinks.forEach((a) => {
        const url = a.href;
        const name = a.textContent?.trim() || '';
        if (!url) return;

        const isChapterUrl =
          url.includes('chap') ||
          name.toLowerCase().includes('chap') ||
          name.toLowerCase().includes('chương');

        const isInChapterList = a.closest(
          '.list-chapter, #nt_listchapter, .works-chapter-list, .chapter-list, .box-list-chapter',
        );

        if (isChapterUrl && isInChapterList) {
          if (!urlSet.has(url)) {
            urlSet.add(url);
            chapters.push({ url, name });
          }
        }
      });

      return {
        title,
        chapters: chapters.reverse(),
      };
    });

    if (mangaData.chapters.length === 0) {
      console.log('❌ Không tìm thấy chapter nào.');
      return;
    }

    const safeMangaName = cleanDirName(mangaData.title);

    const chaptersToRun = ONLY_LAST_CHAPTERS
      ? mangaData.chapters.slice(-MAX_CHAPTERS_TO_DOWNLOAD)
      : mangaData.chapters.slice(0, MAX_CHAPTERS_TO_DOWNLOAD);

    console.log(`📦 Bộ truyện: [${safeMangaName}]`);
    console.log(`📚 Số chương sẽ xử lý: ${chaptersToRun.length}`);

    for (const chapter of chaptersToRun) {
      const safeChapterName = cleanDirName(chapter.name);
      const chapterNumber = normalizeChapterNumber(chapter.name);

      console.log('\n-----------------------------------------');
      console.log(`⏳ Đang cào chương: ${chapter.name}`);
      console.log(`🔢 Chapter number: ${chapterNumber}`);
      console.log(`🔗 URL: ${chapter.url}`);

      const dbChapter = await findOrCreateChapter({
        comicId: comic.id,
        chapterName: chapter.name,
        chapterNumber,
      });

      const interceptedImages = [];

      const onResponse = async (response) => {
        const url = response.url();
        const contentType = response.headers()['content-type'] || '';
        const status = response.status();

        const isImage =
          contentType.startsWith('image/') ||
          /\.(jpg|jpeg|png|webp|avif)(\?.*)?$/i.test(url);

        const isNoise =
          /(avatar|logo|banner|thumb|icon|gif|qc|ads|header|footer|bg|quang-cao)/i.test(url);

        if (isImage && !isNoise && status === 200) {
          try {
            const buffer = await response.buffer();

            if (buffer.length > 10000) {
              interceptedImages.push({
                url,
                buffer,
                contentType,
              });
            }
          } catch {
            // Bỏ qua ảnh lỗi
          }
        }
      };

      page.on('response', onResponse);

      await page.goto(chapter.url, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });

      console.log('🏃‍♂️ Đang cuộn trang để kích hoạt lazy-load ảnh...');

      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          let retries = 0;
          const distance = 800;

          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight) {
              retries++;

              if (retries >= 15) {
                clearInterval(timer);
                resolve();
              }
            } else {
              retries = 0;
            }
          }, 200);
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      page.off('response', onResponse);

      const groups = {};

      for (const img of interceptedImages) {
        const cleanUrl = img.url.split('?')[0];
        const dir = getDirName(cleanUrl);

        if (!groups[dir]) groups[dir] = [];

        if (!groups[dir].some((existing) => existing.url === img.url)) {
          groups[dir].push(img);
        }
      }

      let maxGroupSize = 0;

      for (const dir in groups) {
        if (groups[dir].length > maxGroupSize) {
          maxGroupSize = groups[dir].length;
        }
      }

      let finalImages = [];

      if (maxGroupSize >= 3) {
        for (const dir in groups) {
          if (groups[dir].length >= 2) {
            finalImages.push(...groups[dir]);
          }
        }
      } else {
        for (const dir in groups) {
          finalImages.push(...groups[dir]);
        }
      }

      if (finalImages.length === 0) {
        console.log('⚠️ Không bắt được ảnh nào. Bỏ qua chương này.');
        continue;
      }

      finalImages.sort((a, b) =>
        a.url.localeCompare(b.url, undefined, {
          numeric: true,
          sensitivity: 'base',
        }),
      );

      const uniqueFinalImages = [];
      const seenUrls = new Set();

      for (const img of finalImages) {
        if (!seenUrls.has(img.url)) {
          seenUrls.add(img.url);
          uniqueFinalImages.push(img);
        }
      }

      console.log(`🎯 Tổng ảnh sau khi lọc: ${uniqueFinalImages.length}`);

      let imageCounter = 1;

      for (const img of uniqueFinalImages) {
        const pageNumber = imageCounter;
        const paddedPage = String(pageNumber).padStart(3, '0');

        const cloudFolder = `comics/${COMIC_SLUG_IN_DB}/chapters/${chapterNumber}`;
        const publicId = `${paddedPage}`;

        process.stdout.write(
          `\r☁️ Đang upload page ${paddedPage}/${uniqueFinalImages.length} lên Cloudinary...`,
        );

        try {
          const uploadResult = await uploadBufferToCloudinary(img.buffer, {
            folder: cloudFolder,
            publicId,
          });

          await saveImageToDb({
            chapterId: dbChapter.id,
            order: pageNumber,
            url: uploadResult.secure_url,
            key: uploadResult.public_id,
            width: uploadResult.width,
            height: uploadResult.height,
            size: uploadResult.bytes,
            mimeType: img.contentType,
          });

          imageCounter++;
        } catch (error) {
          console.log(`\n❌ Lỗi upload page ${paddedPage}:`, error.message);
        }
      }

      console.log(`\n✅ Hoàn tất chương: ${safeChapterName}`);
      console.log(`💾 Đã lưu URL ảnh vào DB cho chapterId=${dbChapter.id}`);
    }
  } catch (error) {
    console.error('\n❌ Lỗi hệ thống:', error);
  } finally {
    await browser.close();
    await prisma.$disconnect();
    console.log('\n🎉 Tiến trình hoàn thành!');
  }
}

autoCrawlUploadAndSave(targetUrl);
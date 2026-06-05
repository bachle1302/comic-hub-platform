import {
  ComicStatus,
  PrismaClient,
  Role,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type SeedAuthor = {
  name: string;
  slug: string;
};

type SeedCategory = {
  name: string;
  slug: string;
};

type SeedComic = {
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  thumbnail: string;
  status: ComicStatus;
  isPublic: boolean;
  authorSlug: string;
  categorySlugs: string[];
};

type SeedChapter = {
  comicSlug: string;
  name: string;
  chapterNumber: number;
  price: number;
  isPublic: boolean;
  imageTextPrefix: string;
  keyPrefix: string;
};

const authors: SeedAuthor[] = [
  {
    name: 'Oda Eiichiro',
    slug: 'oda-eiichiro',
  },
  {
    name: 'Kishimoto Masashi',
    slug: 'kishimoto-masashi',
  },
  {
    name: 'Demo Studio',
    slug: 'demo-studio',
  },
];

const categories: SeedCategory[] = [
  { name: 'Action', slug: 'action' },
  { name: 'Adventure', slug: 'adventure' },
  { name: 'Comedy', slug: 'comedy' },
  { name: 'Fantasy', slug: 'fantasy' },
  { name: 'Drama', slug: 'drama' },
  { name: 'Shounen', slug: 'shounen' },
  { name: 'Romance', slug: 'romance' },
  { name: 'School Life', slug: 'school-life' },
];

const comics: SeedComic[] = [
  {
    name: 'One Piece Demo',
    slug: 'one-piece-demo',
    description:
      'Truyen demo dung de test luong doc truyen, chapter free va paid.',
    seoTitle: 'One Piece Demo - Doc truyen tranh online',
    seoDescription:
      'Doc One Piece Demo voi chapter mien phi va tra phi.',
    thumbnail: 'https://placehold.co/400x600?text=One+Piece+Demo',
    status: ComicStatus.ONGOING,
    isPublic: true,
    authorSlug: 'oda-eiichiro',
    categorySlugs: ['action', 'adventure', 'comedy', 'shounen'],
  },
  {
    name: 'Naruto Demo',
    slug: 'naruto-demo',
    description: 'Truyen demo dung de test danh sach, tim kiem va the loai.',
    seoTitle: 'Naruto Demo - Doc truyen tranh online',
    seoDescription: 'Doc Naruto Demo cap nhat moi nhat.',
    thumbnail: 'https://placehold.co/400x600?text=Naruto+Demo',
    status: ComicStatus.ONGOING,
    isPublic: true,
    authorSlug: 'kishimoto-masashi',
    categorySlugs: ['action', 'fantasy', 'shounen'],
  },
];

const chapters: SeedChapter[] = [
  {
    comicSlug: 'one-piece-demo',
    name: 'Chapter 1 - Start',
    chapterNumber: 1,
    price: 0,
    isPublic: true,
    imageTextPrefix: 'One Piece Ch1 Page',
    keyPrefix: 'seed/one-piece-demo/chapter-1',
  },
  {
    comicSlug: 'one-piece-demo',
    name: 'Chapter 2 - Paid Chapter',
    chapterNumber: 2,
    price: 10,
    isPublic: true,
    imageTextPrefix: 'One Piece Ch2 Page',
    keyPrefix: 'seed/one-piece-demo/chapter-2',
  },
  {
    comicSlug: 'naruto-demo',
    name: 'Chapter 1 - Ninja Start',
    chapterNumber: 1,
    price: 0,
    isPublic: true,
    imageTextPrefix: 'Naruto Ch1 Page',
    keyPrefix: 'seed/naruto-demo/chapter-1',
  },
];

function placeholderUrl(text: string): string {
  return `https://placehold.co/900x1300?text=${encodeURIComponent(text)}`;
}

async function seedUsers() {
  const verifiedAt = new Date();
  const [adminPassword, userPassword] = await Promise.all([
    bcrypt.hash('Admin@123456', 10),
    bcrypt.hash('User@123456', 10),
  ]);

  const admin = await prisma.user.upsert({
    where: {
      email: 'admin@manga.local',
    },
    update: {
      name: 'Admin',
      password: adminPassword,
      role: Role.ADMIN,
      coin: 1000,
      emailVerifiedAt: verifiedAt,
      provider: 'local',
      googleId: null,
    },
    create: {
      name: 'Admin',
      email: 'admin@manga.local',
      password: adminPassword,
      role: Role.ADMIN,
      coin: 1000,
      emailVerifiedAt: verifiedAt,
      provider: 'local',
      googleId: null,
    },
  });

  const user = await prisma.user.upsert({
    where: {
      email: 'user@manga.local',
    },
    update: {
      name: 'Demo User',
      password: userPassword,
      role: Role.USER,
      coin: 100,
      emailVerifiedAt: verifiedAt,
      provider: 'local',
      googleId: null,
    },
    create: {
      name: 'Demo User',
      email: 'user@manga.local',
      password: userPassword,
      role: Role.USER,
      coin: 100,
      emailVerifiedAt: verifiedAt,
      provider: 'local',
      googleId: null,
    },
  });

  return {
    admin,
    user,
  };
}

async function seedAuthors() {
  for (const author of authors) {
    await prisma.author.upsert({
      where: {
        slug: author.slug,
      },
      update: {
        name: author.name,
      },
      create: author,
    });
  }
}

async function seedCategories() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        slug: category.slug,
      },
      update: {
        name: category.name,
      },
      create: category,
    });
  }
}

async function seedComics() {
  for (const comic of comics) {
    const author = await prisma.author.findUniqueOrThrow({
      where: {
        slug: comic.authorSlug,
      },
      select: {
        id: true,
      },
    });
    const createdComic = await prisma.comic.upsert({
      where: {
        slug: comic.slug,
      },
      update: {
        name: comic.name,
        description: comic.description,
        seoTitle: comic.seoTitle,
        seoDescription: comic.seoDescription,
        thumbnail: comic.thumbnail,
        status: comic.status,
        isPublic: comic.isPublic,
        authorId: author.id,
      },
      create: {
        name: comic.name,
        slug: comic.slug,
        description: comic.description,
        seoTitle: comic.seoTitle,
        seoDescription: comic.seoDescription,
        thumbnail: comic.thumbnail,
        status: comic.status,
        isPublic: comic.isPublic,
        authorId: author.id,
      },
    });
    const comicCategories = await prisma.category.findMany({
      where: {
        slug: {
          in: comic.categorySlugs,
        },
      },
      select: {
        id: true,
      },
    });

    await prisma.comicCategory.deleteMany({
      where: {
        comicId: createdComic.id,
      },
    });
    await prisma.comicCategory.createMany({
      data: comicCategories.map((category) => ({
        comicId: createdComic.id,
        categoryId: category.id,
      })),
      skipDuplicates: true,
    });
  }
}

async function seedChapters() {
  const createdChapters: Array<{ id: number; comicId: number }> = [];

  for (const chapter of chapters) {
    const comic = await prisma.comic.findUniqueOrThrow({
      where: {
        slug: chapter.comicSlug,
      },
      select: {
        id: true,
      },
    });
    const createdChapter = await prisma.chapter.upsert({
      where: {
        comicId_chapterNumber: {
          comicId: comic.id,
          chapterNumber: chapter.chapterNumber,
        },
      },
      update: {
        name: chapter.name,
        price: chapter.price,
        isPublic: chapter.isPublic,
      },
      create: {
        name: chapter.name,
        chapterNumber: chapter.chapterNumber,
        price: chapter.price,
        isPublic: chapter.isPublic,
        comicId: comic.id,
      },
    });

    await prisma.chapterImage.deleteMany({
      where: {
        chapterId: createdChapter.id,
      },
    });
    await prisma.chapterImage.createMany({
      data: [1, 2, 3].map((order) => ({
        chapterId: createdChapter.id,
        url: placeholderUrl(`${chapter.imageTextPrefix} ${order}`),
        key: `${chapter.keyPrefix}/page-${order}.webp`,
        order,
        width: 900,
        height: 1300,
        size: 123456,
        mimeType: 'image/webp',
      })),
    });

    createdChapters.push({
      id: createdChapter.id,
      comicId: comic.id,
    });
  }

  return createdChapters;
}

async function updateComicCounters() {
  for (const comic of comics) {
    const existingComic = await prisma.comic.findUniqueOrThrow({
      where: {
        slug: comic.slug,
      },
      select: {
        id: true,
      },
    });
    const [chapterCount, latestChapter] = await Promise.all([
      prisma.chapter.count({
        where: {
          comicId: existingComic.id,
        },
      }),
      prisma.chapter.findFirst({
        where: {
          comicId: existingComic.id,
        },
        orderBy: {
          chapterNumber: 'desc',
        },
        select: {
          createdAt: true,
        },
      }),
    ]);

    await prisma.comic.update({
      where: {
        id: existingComic.id,
      },
      data: {
        chapterCount,
        lastChapterAt: latestChapter?.createdAt ?? null,
      },
    });
  }
}

async function seedOptionalDemoData(userId: number) {
  const comic = await prisma.comic.findUniqueOrThrow({
    where: {
      slug: 'one-piece-demo',
    },
    select: {
      id: true,
    },
  });
  const chapter = await prisma.chapter.findFirstOrThrow({
    where: {
      comicId: comic.id,
      chapterNumber: 1,
    },
    select: {
      id: true,
    },
  });

  await prisma.follow.upsert({
    where: {
      userId_comicId: {
        userId,
        comicId: comic.id,
      },
    },
    update: {},
    create: {
      userId,
      comicId: comic.id,
    },
  });
  await prisma.history.upsert({
    where: {
      userId_comicId: {
        userId,
        comicId: comic.id,
      },
    },
    update: {
      chapterId: chapter.id,
      imageIndex: 1,
      progress: 0.35,
    },
    create: {
      userId,
      comicId: comic.id,
      chapterId: chapter.id,
      imageIndex: 1,
      progress: 0.35,
    },
  });
  await prisma.transaction.createMany({
    data: [
      {
        userId,
        amount: 100,
        type: TransactionType.RECHARGE,
        status: TransactionStatus.SUCCESS,
        balanceBefore: 0,
        balanceAfter: 100,
        description: 'Seed demo coin balance',
        orderId: 'seed-demo-user-initial-coin',
      },
    ],
    skipDuplicates: true,
  });
}

async function main() {
  const { admin, user } = await seedUsers();

  await seedAuthors();
  await seedCategories();
  await seedComics();
  await seedChapters();
  await updateComicCounters();
  await seedOptionalDemoData(user.id);

  console.log('Seed completed');
  console.log('Demo accounts:');
  console.log('Admin: admin@manga.local / Admin@123456');
  console.log('User: user@manga.local / User@123456');
  console.log('Demo comics:');
  console.log('- one-piece-demo: chapter 1 free, chapter 2 paid');
  console.log('- naruto-demo: chapter 1 free');
  console.log(`Admin user id: ${admin.id}`);
  console.log(`Demo user id: ${user.id}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

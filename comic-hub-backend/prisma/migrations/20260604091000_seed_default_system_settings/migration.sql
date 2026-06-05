INSERT INTO "SystemSetting" (
    "key",
    "value",
    "valueType",
    "group",
    "label",
    "description",
    "isPublic",
    "updatedAt"
) VALUES
    (
        'general.siteName',
        'Manga Platform',
        'STRING',
        'general',
        'Site name',
        'Public website name.',
        true,
        CURRENT_TIMESTAMP
    ),
    (
        'general.siteDescription',
        'Nền tảng đọc truyện tranh online',
        'STRING',
        'general',
        'Site description',
        'Short public website description.',
        true,
        CURRENT_TIMESTAMP
    ),
    (
        'general.logoUrl',
        '',
        'STRING',
        'general',
        'Logo URL',
        'Public logo image URL.',
        true,
        CURRENT_TIMESTAMP
    ),
    (
        'general.supportEmail',
        'support@example.com',
        'STRING',
        'general',
        'Support email',
        'Public support email address.',
        true,
        CURRENT_TIMESTAMP
    ),
    (
        'general.contactEmail',
        'support@example.com',
        'STRING',
        'general',
        'Contact email',
        'Public contact email address.',
        true,
        CURRENT_TIMESTAMP
    ),
    (
        'seo.defaultTitle',
        'Manga Platform - Đọc truyện tranh online',
        'STRING',
        'seo',
        'Default SEO title',
        'Default SEO title used by clients.',
        true,
        CURRENT_TIMESTAMP
    ),
    (
        'seo.defaultDescription',
        'Đọc truyện tranh online, theo dõi truyện yêu thích và nhận thông báo chương mới.',
        'STRING',
        'seo',
        'Default SEO description',
        'Default SEO description used by clients.',
        true,
        CURRENT_TIMESTAMP
    ),
    (
        'social.facebookUrl',
        '',
        'STRING',
        'social',
        'Facebook URL',
        NULL,
        true,
        CURRENT_TIMESTAMP
    ),
    (
        'social.discordUrl',
        '',
        'STRING',
        'social',
        'Discord URL',
        NULL,
        true,
        CURRENT_TIMESTAMP
    ),
    (
        'social.telegramUrl',
        '',
        'STRING',
        'social',
        'Telegram URL',
        NULL,
        true,
        CURRENT_TIMESTAMP
    ),
    (
        'system.maintenanceMode',
        'false',
        'BOOLEAN',
        'system',
        'Maintenance mode',
        'Public maintenance mode flag.',
        true,
        CURRENT_TIMESTAMP
    ),
    (
        'system.maintenanceMessage',
        'Website đang bảo trì, vui lòng quay lại sau.',
        'STRING',
        'system',
        'Maintenance message',
        'Public maintenance message.',
        true,
        CURRENT_TIMESTAMP
    )
ON CONFLICT ("key") DO NOTHING;


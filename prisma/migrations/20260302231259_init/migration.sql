-- CreateTable
CREATE TABLE `Question` (
    `id` VARCHAR(191) NOT NULL,
    `origin_set` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `question_content` VARCHAR(191) NOT NULL,
    `topic` VARCHAR(191) NOT NULL,
    `difficulty` INTEGER NOT NULL,
    `solution` VARCHAR(191) NOT NULL DEFAULT '',
    `timesAttempted` INTEGER NOT NULL DEFAULT 0,
    `timesCorrect` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Question_questionId_key`(`questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentAttempt` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `topic` VARCHAR(191) NOT NULL,
    `difficulty` INTEGER NOT NULL,
    `correct` BOOLEAN NOT NULL,
    `reflection_note` VARCHAR(191) NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `StudentAttempt_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StudentAttempt` ADD CONSTRAINT `StudentAttempt_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

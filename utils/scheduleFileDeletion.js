import fs from "fs";

const scheduleFileDeletion = (filePath, delayMs = 3600 * 1000) => {
  setTimeout(() => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Помилка видалення файлу ${filePath}:`, err);
      } else {
        console.log(`Файл ${filePath} видалено через ${delayMs / 1000} секунд.`);
      }
    });
  }, delayMs);
};
export default scheduleFileDeletion;
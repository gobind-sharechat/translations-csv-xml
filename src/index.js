import { createReadStream, appendFileSync, unlinkSync, existsSync } from "fs";
import { parse } from "csv-parse";

let languages = [];

const getFileNameFromLanguage = (language) => {
  return `translations/${language}.xml`;
};

const wrapTranslationAsInXmls = (key, translation) => {
  return `<string name="${key}">${translation}</string>\n`;
};

createReadStream("./csv/livestreamTranslations.csv")
  .pipe(parse({ delimiter: ",", from_line: 1, to_line: 1 }))
  .on("data", (data) => {
    languages = data
      .slice(1)
      .filter((value) => value.length > 0)
      .map((languageName) => languageName);

    languages.forEach((language) => {
      if (existsSync(getFileNameFromLanguage(language))) {
        unlinkSync(getFileNameFromLanguage(language));
      }
    });

    createReadStream("./csv/livestreamTranslations.csv")
      .pipe(parse({ delimiter: ",", from_line: 2 }))
      .on("data", (row) => {
        const key = row[0];
        const translations = row.slice(1);
        translations.forEach((translation, index) => {
          if (index >= languages.length) return;
          appendFileSync(
            getFileNameFromLanguage(languages[index]),
            wrapTranslationAsInXmls(key, translation)
          );
        });
      })
      .on("end", function () {
        console.log("Finished");
      })
      .on("error", function (error) {
        console.log(error.message);
      });
  });

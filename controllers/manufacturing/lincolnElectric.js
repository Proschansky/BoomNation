const db = require("../../models");
const puppeteer = require("puppeteer");

module.exports = async (req, res) => {
  const homePage = "https://jobs.lincolnelectric.com/go/Manufacturing-&-Ops-Jobs/2374100/";

  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();

  const hrefs = async () => {
    await page.goto(homePage);

    return await page.evaluate(() => {
      return Array.from(document.getElementsByTagName("a"), (a)=>a.getAttribute("href"));
    });
  };

  const urls = await hrefs();

  const filteredUrls = urls.filter((link) => {
    if (link) {
      const jobsLink = "/job/";
      return link.substring(0, jobsLink.length) === jobsLink;
    }
  });

  for (let i = 0; i < filteredUrls.length; i++) {
    await page.goto(`https://jobs.lincolnelectric.com/${filteredUrls[i]}`);

    const jobTitle = await page.evaluate(() => {
        return Array.from(
          document.getElementsByTagName('h1'),
          (title) => title.textContent
        );
      });
    
    const jobDate = await page.evaluate(() => {
        return Array.from(
          document.getElementById('job-date'),
          (date) => {
              let arr = [];
              for(let i = 0; i < date.children.length; i++){
                arr.push(date.children[i].textContent)
              }
              return arr;
          }
        );
      }); 
    
    console.log(jobDate)

    const job = {};
    job.url = `https://jobs.lincolnelectric.com/${filteredUrls[i]}`;
    job.jobTitle = jobTitle[0];


    // //Creating the new record in the database, for those records, which don't yet exist.
    // db.Manufacturing.findOne({ url: job.url }).then((res) => {
    //   if (!res) {
    //     db.Manufacturing.create({
    //       company: job.company,
    //       jobDescription: job.jobDescription,
    //       internalId: job.internalId,
    //       jobTitle: job.jobTitle,
    //       jobType: job.jobType,
    //       url: job.url,
    //       workLocations: job.workLocations,
    //     }).catch((err) => console.log(err));
    //   }
    // });

    // //Removing jobs no longer posted on the website from our collection.
    // db.Manufacturing.find()
    //   .then((records) => {
    //     for (let j = 0; j < records.length; j++) {
    //       if (urls.indexOf(records[j].url) === -1) {
    //         db.Manufacturing.updateOne(
    //           { url: records[j].url },
    //           { deleted: true }
    //         ).catch((err) => console.log("ERROR DELETING URL LINE 88", err));
    //       }
    //     }
    //   })
    //   .catch((err) =>
    //     console.log("ERROR FINDING PETROCHEMICAL RECORDS LINE 93", err)
    //   );
  }

  res.sendStatus(200).end();
};

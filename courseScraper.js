/* Laurier Course Scraper
 * Author: nvplus
 * Description: Queries the Laurier academic calendar for undergraduate courses.
 */

const cheerio = require('cheerio'); 
const axios = require('axios');
const year = 81; //This is the year code for 2020/21. TODO: Let you search different years

exports.scrapeCourse = scrapeCourse;

/* Scrapes a Laurier course
 * @param {String} courseID (e.g. CP312, GG231, ST259)
 * @return {Promise} A promise that resolves to an object {id, title, description, requirements, exclusions}
 */
async function scrapeCourse(courseID) {
    courseURL = await _getCourseURL(courseID);
    courseInfo = await _getCourseInfo(courseURL);

    return courseInfo;
}

// Queries the Laurier academic calendar for the URL for the specified course.
function _getCourseURL (courseID) {
    url = `https://academic-calendar.wlu.ca/search.php?s_text=${courseID}&cal=1&y=${year}&s_levels%5B%5D=1&s_levels%5B%5D=2&s_levels%5B%5D=3&s_levels%5B%5D=4&submit.x=8&submit.y=10`;

    return new Promise((resolve, reject) => {
        axios.get(url).then((response) => {
            const courseHTML = response.data;
            const $ = cheerio.load(courseHTML);

            // If the course showed up at the top of the search, return its URL.
	// UPDATE: 2020/21 calendar uses strong instead of b tags
            if ($('.res > dl > dt > a > strong').eq(0).text().toLowerCase().includes(courseID.toLowerCase())) {
                resolve("https://academic-calendar.wlu.ca/" + $('.res > dl > dt > a').eq(0).attr('href'));
            }

            reject("Course was unable to be found.");
        });
    });
}

// Grabs the course info and returns a JSON with its info.
function _getCourseInfo (courseURL) { 
    return new Promise((resolve, reject) => {

        axios.get(courseURL)
        .then((response) => {
            const $ = cheerio.load(response.data);
            
            resolve ({
                title: $('h1 > span').eq(0).text(),
                description: $('p').text(),
                required: $('.required').text(),
                exclusions: $('.exclusions').text()
            });

            reject("Error in obtaining course info.");
        });
    });
}
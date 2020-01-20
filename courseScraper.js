const cheerio = require('cheerio'); 
const axios = require('axios');

function scrapeCourse(courseID) {
    return new Promise((resolve, reject) => {
        const courseInfo = _getCourseInfo(courseID);

        if (courseInfo) {
            resolve(courseInfo);
        }

        reject("Unable to query the course.");
    });
}

// Queries the Laurier academic calendar for the URL for the specified course.
var _getCourseURL = (courseID) => {
    url = "https://academic-calendar.wlu.ca/search.php?s_text={$courseID}&cal=1&y=79&s_levels%5B%5D=1&s_levels%5B%5D=2&s_levels%5B%5D=3&s_levels%5B%5D=4&submit.x=8&submit.y=10";
    
    axios(url)
    .then(function(response){
            const courseHTML = response.data;
            const $ = cheerio.load(courseHTML);

            // Returns first link in the list of courses if the course showed up at the top of the searchr esults.
            if ($('.res > dl > dt > a > b').text().contains(courseID)) {
                return $('.res > dl > dt > a').attr('href');
            }   
    });

    return null;
}

// Grabs the course info and returns a JSON with its info.
var  _getCourseInfo = (courseID) => {    
    courseURL = _getCourseURL(courseID);

    if (course) {
        axios(courseURL)
        .then((response) => {
            const $ = cheerio.load(cheerio.load(response.data));

            return {
                title: $('h1 > span').text(),
                description: $('p'),
                required: $('.required').text(),
                exclusions: $('.exclusions').text()
            }
        });
    }

    return null;
}


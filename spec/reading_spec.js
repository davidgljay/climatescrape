var Reading = require('../models/reading.js');
process.env.ENV=="test";

describe ("Readings", function() {

	var mock_reading = {
		title: "Stuff",
		body: "Things",
		tags: [],
		url: "http://presto.watch",
		site_code: "test",
		site_name: "Testing",
		crawled_on: 1441404539763,
		created_on: 1441404539763,
		type:"test"
	};

	describe ("date detection", function() {

		var reading;

		beforeEach(function() {
			reading = new Reading(mock_reading.title, mock_reading.body, mock_reading.tags, mock_reading.url, mock_reading.site_code, mock_reading.site_name, mock_reading.crawled_on, mock_reading.created_on, mock_reading.type);
		})

		it("should detect a date of the format M/D/YYYY and MM/DD/YYYY", function() {
			reading.body = "Lorem ipsum 2/3/2015!";
			expect(reading.getFirstDate().getTime()).toEqual(new Date("2/3/2015").getTime());
			reading.body = "Lorem ipsum 02/03/2015!";
			expect(reading.getFirstDate().getTime()).toEqual(new Date("2/3/2015").getTime());

		});

		it("should detect a date of the format D/M/YYYY and DD/MM/YYYY", function() {
			
			//Todo: how do I detect this??
		});

		it("should detect a date of the format MMM D,YYYY and MMMM D, YYYY", function() {
			reading.body = "Lorem ipsum February 3, 2015!";
			expect(reading.getFirstDate().getTime()).toEqual(new Date("2/3/2015").getTime());
			reading.body = "Lorem ipsum Feb 3, 2015!";
			expect(reading.getFirstDate().getTime()).toEqual(new Date("2/3/2015").getTime());
			reading.body = "Lorem ipsum feb 3, 2015!";
			expect(reading.getFirstDate().getTime()).toEqual(new Date("2/3/2015").getTime());
			reading.body = "Lorem ipsum FEB 3, 2015!";
			expect(reading.getFirstDate().getTime()).toEqual(new Date("2/3/2015").getTime());
		});

	    it("should return false if no date is found", function() {
			expect(reading.getFirstDate()).toBe(false);
		});
	});
});
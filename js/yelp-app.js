(function() {

	/* UI Components */

	var isRunning = true;
	var button = document.getElementById('toggle');

	button.addEventListener('click', function(e){
		if(isRunning) {
			pubnub.unsubscribe({
				channel: channel
			});
			button.value = 'Stream again';
			isRunning = false;
		} else {
			getData();
			button.value = 'Stop me!';
			isRunning = true;
		}

	}, false);


	/* Emotional Data */

	var tally = {};

	var positiveColor = '#008000';
	var negativeColor = '#FF8586';
	var neutralColor = '#DECEB3';

	var excited = {
		type: 'positive',
		icon: 'grinning-face.png'
	};
	var glad = {
		type: 'positive',
		icon: 'smiling-face.png'
	};
	var neutral = {
		type: 'neutral',
		icon: 'neutral-face.png'
	};
	var unhappy = {
		type: 'negative',
		icon: 'pensive-face.png'
	};
	var angry = {
		type: 'negative',
		icon: 'crying-face.png'
	};


	/* D3  */

	var width = 900;
	var height = 540;

	var projection = d3.geo.albersUsa();
		//.scale(900);

	var color = d3.scale.linear()
		.domain([0, 15])
		.range(['#5b5858', '#4f4d4d', '#454444', '#323131']);

	var svg = d3.select('#map').append('svg')
			.attr('width', width)
			.attr('height', height);

	var path = d3.geo.path()
	    .projection(projection);

	var g = svg.append('g');

	d3.json('json/us-states.json', function(error, topology) {
	    g.selectAll('path')
			.data(topojson.feature(topology, topology.objects.usStates).features)
			.enter()
			.append('path')
			.attr('class', function(d){ return 'states ' + d.properties.STATE_ABBR;} )
			.attr('d', path)
			.attr('fill', function(d, i) { return color(i); });
			getYelpData();
	});

	var faceIcon = svg.selectAll('image').data([0]);


	function getYelpData() {
		var data1 = {"emotion": "angry", "business_id": "vcNAWiLM4dR7D2nwwJ7nCA", "full_address": "4840 E Indian School Rd\nSte 101\nPhoenix, AZ 85018", "hours": {"Tuesday": {"close": "17:00", "open": "08:00"}, "Friday": {"close": "17:00", "open": "08:00"}, "Monday": {"close": "17:00", "open": "08:00"}, "Wednesday": {"close": "17:00", "open": "08:00"}, "Thursday": {"close": "17:00", "open": "08:00"}}, "open": true, "categories": ["Doctors", "Health & Medical"], "city": "Phoenix", "review_count": 9, "name": "Eric Goldberg, MD", "neighborhoods": [], "longitude": -111.98375799999999, "state": "AZ", "stars": 3.5, "latitude": 33.499313000000001, "attributes": {"By Appointment Only": true}, "type": "business"};
		var data2 = {"emotion": "neutral", "business_id": "UsFtqoBl7naz8AVUBZMjQQ", "full_address": "202 McClure St\nDravosburg, PA 15034", "hours": {}, "open": true, "categories": ["Nightlife"], "city": "Dravosburg", "review_count": 4, "name": "Clancy's Pub", "neighborhoods": [], "longitude": -79.886930000000007, "state": "PA", "stars": 3.5, "latitude": 40.350518999999998, "attributes": {"Happy Hour": true, "Accepts Credit Cards": true, "Good For Groups": true, "Outdoor Seating": false, "Price Range": 1}, "type": "business"};
		processYelpData(data1);
		processYelpData(data2);
	}

	function getYelpUserInfo(data, callback) {
		var userInfo = {};

		userInfo.lat = data.latitude;
		userInfo.lon = data.longitude;

		if(userInfo.lat === 0 && userInfo.lon === 0) return;

		userInfo.state = data.state;
		userInfo.name = data.name;
		//console.log(userInfo.lat);
		//console.log(userInfo.lon);
		//console.log(userInfo.state);
		callback(userInfo);
	}

	function displayYelpData(data, emotion) {

		getYelpUserInfo(data, function(user){
			document.querySelector('.emotion').style.backgroundImage = 'url(images/'+ emotion.icon +')';

			document.querySelector('.button').href = 'https://yelp.com/' + user.name;
			//document.querySelector('.header').style.backgroundImage = 'url('+ user.avatar +')';
			document.querySelector('.name').textContent = user.name;
			document.querySelector('.screenname').textContent = '@' + user.name;
			document.querySelector('.text').innerHTML = user.full_address;
			//document.querySelector('.timestamp').textContent = user.timestamp;

			//document.querySelector('.reply').href ='https://twitter.com/intent/tweet?in_reply_to=' + user.id_str;
			//document.querySelector('.retweet').href = 'https://twitter.com/intent/retweet?tweet_id=' + user.id_str;
			//document.querySelector('.favorite').href = 'https://twitter.com/intent/favorite?tweet_id=' + user.id_str;

			document.querySelector('.tweet').style.opacity = 0.9;

			if(document.querySelector('.'+user.state)) {
				tally[user.state] = (tally[user.state] || {positive: 0, negative: 0, neutral: 0});
				tally[user.state][emotion.type] = (tally[user.state][emotion.type] || 0) + 1;

				var stateEl = document.querySelector('.'+user.state);
				var max = Math.max(tally[user.state].positive,tally[user.state].negative,tally[user.state].neutral);
				if (max == tally[user.state].positive)
					stateEl.style.fill = positiveColor;
				else if (max == tally[user.state].negative)
					stateEl.style.fill = negativeColor;
				else stateEl.style.fill = neutralColor;

				stateEl.setAttribute('data-positive', tally[user.state].positive);
				stateEl.setAttribute('data-negative', tally[user.state].negative);
				stateEl.setAttribute('data-neutral', tally[user.state].neutral);
			}

			// Place emotion icons

			var position = projection([user.lon, user.lat]);
			if(position === null) return;

			faceIcon.enter()
				.append('svg:image')
				.attr('xlink:href', 'images/'+ emotion.icon)
				.attr('width', '26').attr('height', '26')
           		.attr('transform', function(d) {return 'translate(' + position + ')';});
		});
	}

	function processYelpData(data) {
		if(!data) return;
		setTimeout(displayYelpData(data, eval(data.emotion)), 10000);;

	}



})();
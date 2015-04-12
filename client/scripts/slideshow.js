slideshow = new Meteor.Collection("slideshow")
Meteor.subscribe("slideshow")

tagmode = new Meteor.Collection("tagmode")
Meteor.subscribe("tagmode")

syncStream = new Meteor.Stream('sync');

var cursor = [], counter = 0;
var num_flips_without_refresh = 5;

var current;

Template.slideshow.helpers({
	current: function() {
		return Session.get("current")
	}
})

Template.slideshow.events({
	"click .slides-wrapper": function (event) {
		syncStream.emit("flip", "")
	}
})

function update(newId) {
	if (current) {

		// Do not reload self
		if (current.data("id") == newId) {
			/* If there is only one slide then we
			 * want this check so that we do not
			 * needlessly flash the screen */
			return;
		}

		current.hide()
		try {
			var v = $("video", current).get(0)
			v.pause()
		} catch(e) {}
	}

	current = $("[data-id=" + newId + "]")
	current.show()

	try {
		var v = $("video", current).get(0)
		v.load()
		setTimeout(function() {
			v.play()
		}, 400);

	} catch(e) {}

}

window.update = update

syncStream.on('tick', function(message) {

	var syncedTime = Tracker.nonreactive(TimeSync.serverTime);
	var timeToSwitch = message.switchtime - syncedTime
	//timeToSwitch -= Tracker.nonreactive(TimeSync.roundTripTime) / 2;

	setTimeout(function() {
		update(message[_screen])
	}, timeToSwitch);
});

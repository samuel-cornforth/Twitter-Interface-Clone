/* Sample JSON data: */
var allUsers = {user1: {
    userName: '@elonmusk',
    displayName: 'Elon Musk',
    joinedDate: 'June 2009',
    followingCount: 103,
    followerCount: 47900000,
    avatarURL: '/assets/elonmusk.jpg',
    coverPhotoURL: '/assets/elonmusk-cover.jpeg',
    tweets: [
        {
            text: 'I admit to judging books by their cover',
            timestamp: '2/10/2023 00:01:20'
        },
        {
            text: 'Starship to the moon',
            timestamp: '2/09/2022 18:37:12'
        },
        {
            text: 'Out on launch pad, engine swap underway',
            timestamp: '2/09/2021 12:11:51'
        }
    ]
},

    user2: {
    userName: '@BillGates',
    displayName: 'Bill Gates',
    joinedDate: 'June 2009',
    followingCount: 274,
    followerCount: 53800000,
    avatarURL: '/assets/billgates.jpg',
    coverPhotoURL: '/assets/billgates-cover.jpeg',
    tweets: [
        {
            text: 'Everybody asks, how is the next Windows coming along? But nobody asks how is Bill? :/',
            timestamp: '2/10/2022 00:01:20'
        },
        {
            text: 'Should I start tweeting memes? Let me know in a comment.',
            timestamp: '2/09/2021 18:37:12'
        },
        {
            text: 'In 2020, I read a book every hour.',
            timestamp: '2/09/2021 12:11:51'
        }
    ]
    }
};
/* Quick convert into alternative format: */
let allTweets = [];
for (let user in allUsers) {
    allTweets = allTweets.concat(allUsers[user].tweets.map(tweet => new Object({"user": allUsers[user], ...tweet})))
}
/* End of sample JSON data */

$(() => {
    if (window.location.pathname.includes("timeline.html")) {
        loadAllTweets();
    } else {
        // index.html behaviour
        const urlParams = new URLSearchParams(window.location.search);
        const userStr = urlParams.get('user');
        // if no user entered or user doesn't exist, redirect to first user!
        if (!userStr || !allUsers[userStr]) {
            window.location.href = window.location.pathname + "?user=user1"
        }
        let user = allUsers[userStr];
        user.tweets.forEach(tweet => renderTweet(tweet, user));
        // load everything on page for that user
        loadFromUser(user);
    }
})

/**
 * Load all tweets, from all users
 */
function loadAllTweets() {
    // copy array so as not to modify original in any way
    let tweetsToDisplay = [...allTweets];
    tweetsToDisplay.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    for (let tweet of tweetsToDisplay) {
        renderTweet(tweet, tweet["user"])
    }
}

/**
 * Load twitter feed
 * @param {Object} user
 */
function loadFromUser(user, fromParent = document.body) {
    const parent = $(fromParent);
    parent.find(".profile-display-name").html(user.displayName + $("#checkmark-svg-template").html() + $("#twitter-square-template").html());
    parent.find(".profile-twitter-handle").text(user.userName);
    parent.find(".profile-background").css({"background-image": `url(../${user.coverPhotoURL})`})
    parent.find(".profile-icon").css({"background-image": `url(../${user.avatarURL})`});
    parent.find(".profile-join-date").html($("#calendar-svg-template").html() + `Joined ${user.joinedDate}`);
    parent.find(".profile-following-count").text(`${abbreviateNumber(user.followingCount)}`);
    parent.find(".profile-follower-count").text(`${abbreviateNumber(user.followerCount)}`);
}

/**
 * Abbreviate a number with a suffix (e.g., 1000 becomes 1K).
 *
 * @param {number} number - The number to abbreviate.
 * @returns {string} The abbreviated number with a suffix.
 */
function abbreviateNumber(number) {
    const SI_SYMBOL = ["", "K", "M", "G", "T", "P", "E"];

    const tier = Math.log10(Math.abs(number)) / 3 | 0;

    if (tier === 0) return number;

    const suffix = SI_SYMBOL[tier];
    const scale = Math.pow(10, tier * 3);
    const scaledNumber = number / scale;

    return scaledNumber.toFixed(1) + suffix;
}

/**
 * Create tweet html from template, and append to element
 * @param {Object} tweet The tweet object with 'text' (string) and 'timestamp' (Date) properties
 * @param {Object} user The user to load the tweet for
 * @return {HTMLElement} The newly created template
 */
function renderTweet(tweet, user) {
    const inputs = {
        "tweet-contents": tweet.text,
        "tweet-recency": abbreviatedRecency(tweet.timestamp)
    };

    let tweetElement = $(formatString($("#tweet-template").html(), inputs)).appendTo("#tweets-listing");
    loadFromUser(user, tweetElement);
    return tweetElement;
}

/**
 * Takes a string of format: "Text {key1} {key2}" and replaces 'key1' and
 * 'key2' with values of passed object that match those key literals
 * @param {string} string The string to format
 * @param {Object} argsObject The values to insert into the string
 * @return {string} The formatted string literal
 */
function formatString(string, argsObject) {
    return string.replace(/{([\w-_]+)}/g, function(match, key) {
        if (typeof argsObject[key] != 'undefined') {
        return argsObject[key];
        } else {
        return match;
        }
    });
}

/** 
 * Takes a literal date-time and returns an abbreviated string of how recent it is.
 * @param {Date} date
 * @returns {string}
 * */
function abbreviatedRecency(date) {
    const then = new Date(date);
    const now = new Date();
    const difference = now - then;
    const timeIntervals = [
        {"divisor": 31104000000, "unit": "y"},
        {"divisor": 2592000000, "unit": "mo"},
        {"divisor": 86400000, "unit": "d"},
        {"divisor": 3600000, "unit": "h"},
        {"divisor": 60000, "unit": "m"},
        {"divisor": 1000, "unit": "s"}
    ];

    for (let interval of timeIntervals) {
        if (difference > interval["divisor"]) {
        return String(Math.floor(difference / interval["divisor"])) + interval["unit"];
        }
    }
    // found none = return '0s' aka 'zero seconds'
    return String(0) + timeIntervals[timeIntervals.length - 1]["unit"];
}
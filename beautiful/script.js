// var timePoint = [
//     { name: 'sunrise', time: [
//             [3, 0],
//             [5, 59]
//         ], order: 1, seconds: 2 * 3600 + 59 * 60 + 59 },
//     { name: 'early AM', time: [
//             [6, 0],
//             [6, 59]
//         ], order: 2, seconds: 59 * 60 + 59 },
//     { name: 'AMPeak', time: [
//             [7, 0],
//             [8, 59]
//         ], order: 3, seconds: 3600 + 59 * 60 + 59 },
//     { name: 'middayBase', time: [
//             [9, 0],
//             [13, 29]
//         ], order: 4, seconds: 4 * 3600 + 29 * 60 + 59 },
//     { name: 'middaySchool', time: [
//             [13, 30],
//             [15, 59]
//         ], order: 5, seconds: 2 * 3600 + 29 * 60 + 59 },
//     { name: 'PMPeak', time: [
//             [16, 0],
//             [18, 29]
//         ], order: 6, seconds: 2 * 3600 + 29 * 60 + 59 },
//     { name: 'evening', time: [
//             [18, 30],
//             [21, 59]
//         ], order: 7, seconds: 3 * 3600 + 29 * 60 + 59 },
//     { name: 'lateEvening', time: [
//             [22, 0],
//             [23, 59]
//         ], order: 8, seconds: 1 * 3600 + 59 * 60 + 59 },
//     { name: 'night', time: [
//             [0, 0],
//             [2, 59]
//         ], order: 9, seconds: 2 * 3600 + 59 * 60 + 59 }
// ]
var timePoint = [{
        name: 'morning',
        time: [
            [6, 0],
            [11, 59]
        ],
        order: 1,
        seconds: 5 * 3600 + 59 * 60 + 59
    },
    {
        name: 'afternoon',
        time: [
            [12, 0],
            [17, 59]
        ],
        order: 2,
        seconds: 5 * 3600 + 59 * 60 + 59
    },
    {
        name: 'evening',
        time: [
            [18, 0],
            [23, 59]
        ],
        order: 3,
        seconds: 5 * 3600 + 59 * 60 + 59
    },
    {
        name: 'lateNight',
        time: [
            [0, 0],
            [5, 59]
        ],
        order: 4,
        seconds: 5 * 3600 + 59 * 60 + 59
    }
]
console.log('timePeriod: ', timePoint)
var seasonPoint = [
    { name: 'spring', range: [3, 4, 5], order: 1 },
    { name: 'summer', range: [6, 7, 8], order: 2 },
    { name: 'autumn', range: [9, 10, 11], order: 3 },
    { name: 'winter', range: [12, 1, 2], order: 4 }
]

var file = '../beautiful/data/trip.csv';
var w = window.innerWidth,
    h = window.innerHeight,
    eachH = h * .8
console.log(eachH)
var random = d3.scaleQuantize()
    .domain([0, 1])
    .range([1, 2, 3, 4]);

d3.queue()
    .defer(d3.csv, file, parse)
    .await(dataloaded);

function dataloaded(err, trips) {
    console.log('Raw data: ', trips)
    const tripsByseason = d3.nest()
        .key(d => d.season)
        .key(d => d.point)
        .rollup(l => {
            let totalDuration = d3.sum(l, el => el.duration)
            let timeSecond = timePoint.find(el => el.name == l[0].point).seconds
            let treeCount = Math.floor(totalDuration * 0.00267 * 411 / (16000 / 24 / 60 / 60 * timeSecond) / 100)
            let trees = []
            for (i = 0; i < treeCount; i++) {
                trees.push({ img: random(Math.random()), x: Math.random(), y: Math.random(), season: l[0].season })
            }
            return {
                time: l[0].point,
                season: l[0].season,
                rides: l,
                totalDuration: totalDuration,
                trees: trees
            }
        })
        .entries(trips)
    console.log('nested: ', tripsByseason)
    console.log('formulation of tree count: totalDuration * 0.00267 * 411 / (16000 / 24 / 60 / 60 * secondsOfThisTimeperiod)')
    draw(tripsByseason)

}

function draw(data) {

    // Duration * 0.00267 * 411 = total grams | 20 km/h (12.4274 mile/hour: 0.00345 mile/sec)
    // 16000 / 24 / 60 / 60  = grams per second
    d3.select('.container').append('div').attr('class','label').html('spring')
    var svg = d3.select('#canvas').append('svg')
        .attr('width', w).attr('height', eachH * timePoint.length * 4)
    svg.append('svg:image')
        .attr('class', 'bg')
        .attr('xlink:href', '../beautiful/img/backgroundlong.jpg')
        .attr('height', eachH * timePoint.length * 4)

    //update
    var updateTimepoint = svg.selectAll('.timepoint').data(data.sort((x, y) => {
        return d3.ascending(seasonPoint.find(d => d.name == x.key).order, seasonPoint.find(d => d.name == y.key).order);
    }))
    var enterTimepoint = updateTimepoint.enter().append('g').attr('class', d => `timepoint ${slug(d.key)}`)
        .attr('transform', (d, i) => `translate(0,${i * eachH * 4})`)
    var updateSeason = enterTimepoint.selectAll('.season').data(d => d.values.sort((x, y) => {
        return d3.ascending(timePoint.find(d => d.name == x.key).order, timePoint.find(d => d.name == y.key).order);
    }))
    var enterSeason = updateSeason.enter().append('g').attr('class', d => `season ${d.key}`)
        .attr('transform', (d, i) => `translate(0,${i * eachH})`)

    var updatetrees = enterSeason.append('g').attr('class', 'trees').selectAll('.tree').data(d => d.value.trees),
        entertrees = updatetrees.enter()
        .append('svg:image')
        .attr('class', 'tree')
        .attr('xlink:href', d => `../beautiful/img/${d.season}${d.img}.svg`)
        .attr('transform', d => `translate(${d.x * w * .8 + w * .05},${d.y * eachH * .7})`)
    // var updaterider = enterSeason.append('g').attr('class','riders').attr('transform',`translate(0,${eachH * .7})`).selectAll('.rider').data((d, i) => console.log(d.value,i,d.key)),
    // enterrider = updaterider.enter().append('g').attr('class','rider');
    // enterrider.append('circle').attr('r',3).attr('transform', `translate(${Math.random() * w /4},${eachH * .7 * Math.random()})`)
    var timelabelContainer = enterSeason.append('g').attr('class', 'timelabel').attr('transform', `translate(0,${eachH})`)
    timelabelContainer.append('text').html(d => `${d.value.season} ${d.value.time}`)

}

function slug(data) {
    let newdata = data.replace(' ', '-')
    return newdata
}

function parse(d) {
    var date = new Date(d['starttime'].replace(/-/g, "/"));
    var refDate = new Date(date)
    var mon = date.getMonth() + 1;

    var point = timePoint.find(t => {
        var start = refDate.setHours(t.time[0][0], t.time[0][1], 0)
        var end = refDate.setHours(t.time[1][0], t.time[1][1], 59)
        return date >= new Date(start) && date <= new Date(end)
    }).name;
    var season = seasonPoint.find(s => s.range.includes(mon)).name;
    return {
        duration: +d.tripduration,
        starttime: date.getTime(),
        season: season,
        point: point
    }
}
var timePoint = [{
        name: 'sunrise',
        // time: [
        //     [3, 0],
        //     [5, 59]
        // ],
        order: 1,
        seconds: 2 * 3600 + 59 * 60 + 59,
        e: 2 * 3600 + 59 * 60 + 59,
    },
    {
        name: 'early AM',
        // time: [
        //     [6, 0],
        //     [6, 59]
        // ],
        order: 2,
        seconds: 59 * 60 + 59,
        e: 3 * 3600 + 59 * 60 + 59,
    },
    {
        name: 'AMPeak',
        // time: [
        //     [7, 0],
        //     [8, 59]
        // ],
        order: 3,
        seconds: 3600 + 59 * 60 + 59,
        e: 5 * 3600 + 59 * 60 + 59,
    },
    {
        name: 'middayBase',
        // time: [
        //     [9, 0],
        //     [13, 29]
        // ],
        order: 4,
        seconds: 4 * 3600 + 29 * 60 + 59,
        e: 10 * 3600 + 29 * 60 + 59,
    },
    {
        name: 'middaySchool',
        // time: [
        //     [13, 30],
        //     [15, 59]
        // ],
        order: 5,
        seconds: 2 * 3600 + 29 * 60 + 59,
        e: 12 * 3600 + 59 * 60 + 59,
    },
    {
        name: 'PMPeak',
        // time: [
        //     [16, 0],
        //     [18, 29]
        // ],
        order: 6,
        seconds: 2 * 3600 + 29 * 60 + 59,
        e: 15 * 3600 + 29 * 60 + 59,
    },
    {
        name: 'evening',
        // time: [
        //     [18, 30],
        //     [21, 59]
        // ],
        order: 7,
        seconds: 3 * 3600 + 29 * 60 + 59,
        e: 18 * 3600 + 59 * 60 + 59,
    },
    {
        name: 'lateEvening',
        // time: [
        //     [22, 0],
        //     [23, 59]
        // ],
        order: 8,
        seconds: 1 * 3600 + 59 * 60 + 59,
        e: 20 * 3600 + 59 * 60 + 59,

    },
    {
        name: 'night',
        // time: [
        //     [0, 0],
        //     [2, 59]
        // ],
        order: 9,
        seconds: 2 * 3600 + 59 * 60 + 59,
        e: 23 * 3600 + 59 * 60 + 59,

    }
]
console.log('timePeriod: ', timePoint)
// var seasonPoint = [
//     { name: 'spring', range: [3, 4, 5], order: 1 },
//     { name: 'summer', range: [6, 7, 8], order: 2 },
//     { name: 'autumn', range: [9, 10, 11], order: 3 },
//     { name: 'winter', range: [12, 1, 2], order: 4 }
// ]
var seasonKey = ['spring', 'summer', 'autumn', 'winter']
var file = '../beautiful/data/tripBytree.csv';
var w = window.innerWidth,
    h = window.innerHeight;
var minR = 3,
    R = 3,
    minTree;
var all = {},
    nowSeason = 'spring';
// var nowSeason = document.querySelector('#nowSeason');
var svg = d3.select('#canvas').append('svg').attr('width', w - 15).attr('height', h * 4)
var timeLineRight = d3.scaleLinear().domain([0, d3.max(timePoint, d => d.e)]).range([10, w / 2 * .7])
var timeLineLeft = d3.scaleLinear().domain([d3.max(timePoint, d => d.e), 0]).range([10, w / 2 * .7])
var scaleRider = d3.scaleLinear().range([h * .35, h * .8])
d3.queue()
    .defer(d3.csv, file, parse)
    .await(dataloaded);

function dataloaded(err, trips) {
    // console.table(trips)
    scaleRider.domain(d3.extent(trips, d => d.rides))
    minTree = d3.min(trips, d => d.trees)

    seasonKey.forEach(season => {
        all[season] = trips.filter(trip => trip.season == season)
    })

    drawTitles()
    drawone(all.spring, 'spring')
    drawone(all.summer, 'summer')
    drawone(all.autumn, 'autumn')
    drawone(all.winter, 'winter')
    window.addEventListener('scroll', debounce(checkSlide));


    // const tripsByseason = d3.nest()
    //     .key(d => d.season)
    //     .key(d => d.point)
    //     .rollup(l => {
    //         let totalDuration = d3.sum(l, el => el.duration)
    //         let timeSecond = timePoint.find(el => el.name == l[0].point).seconds
    //         let treeCount = Math.floor(totalDuration * 0.00267 * 411 / (16000 / 24 / 60 / 60 * timeSecond) / 100)
    //         // let trees = []
    //         // for (i = 0; i < treeCount; i++) {
    //         //     trees.push({ img: random(Math.random()), x: Math.random(), y: Math.random(), season: l[0].season })
    //         // }
    //         return {
    //             time: l[0].point,
    //             season: l[0].season,
    //             rides: l.length,
    //             totalDuration: totalDuration,
    //             trees: treeCount,
    //         }
    //     })
    //     .entries(trips)
    // console.log('nested: ', tripsByseason)
    // console.log('formulation of tree count: totalDuration * 0.00267 * 411 / (16000 / 24 / 60 / 60 * secondsOfThisTimeperiod)')
    // draw(tripsByseason)

    // var all =[]
    //     tripsByseason.forEach(d => {
    //         d.values.forEach(e => {
    //             riders.push(e.value.rides.length);
    //             duration.push(e.value.totalDuration)
    //             all.push(Object.values(e.value))
    //         })
    //     })
    //     scaleRider.domain(d3.extent(riders))
    //     drawall(tripsByseason)

}

function checkSlide() {
    for (i = 0; i < seasonKey.length; i++) {
        let thisSeason = document.querySelector(`#${seasonKey[i]}`).getBoundingClientRect().top
        console.log(thisSeason)
        if (thisSeason > 0) {
            if (seasonKey[i] !== nowSeason) {
                console.log(thisSeason > 0, seasonKey[i], nowSeason)

                drawone(all[`${seasonKey[i]}`], `${seasonKey[i]}`)
            }
            nowSeason = seasonKey[i];
            break
        }
    }
}

function drawTitles() {
    var title = svg.selectAll('.season').data(seasonKey).enter().append('g').attr('class', d => { return 'season' })
        .attr('transform', (d, i) => `translate(0, ${h * i})`).attr('id', d => d)
    title.append('text').attr('transform', `translate(${w / 2},${h * .9})`).style('text-anchor', 'middle')
        .html(d => d)
}

function drawone(data, season) {

    var updateBubbleGroup = svg.select(`#${season}`).selectAll(`.timePoint${season}`).data(data)
    var enterBubbleGroup = updateBubbleGroup.enter().append('g').attr('class', `timePoint${season}`)

    enterBubbleGroup.append('circle').attr('class', 'bubbleco2')
        .attr('r', 0)
        .attr('cy', d => scaleRider(d.rides))
        .attr('cx', d => { return w / 2 + timeLineRight(timePoint.find(n => n.name == d.time).e) })
        .style('fill', '#999').style('opacity', .7)
        .attr('data-name', d => `${slug(d.time)}co2`)
    enterBubbleGroup.append('circle').attr('class', 'bubbletree')
        .attr('r', 0)
        .attr('cy', d => scaleRider(d.rides))
        .attr('cx', d => { return 150 + timeLineLeft(timePoint.find(n => n.name == d.time).e) })
        .style('fill', '#618c77').style('opacity', .7)
        .attr('data-name', d => `${slug(d.time)}`)
    enterBubbleGroup.append('rect').attr('class', 'timelineco2')
        .attr('y', h * .2).attr('x', d => {
            let point = timePoint.find(t => t.name == d.time);
            return point.order == 1 ? (w / 2 + timeLineRight(0)) : (w / 2 + timeLineRight(timePoint.find(n => n.order == point.order - 1).e))
        })
        .attr('height', '10px')
        .attr('data-name', d => `${slug(d.time)}co2`)
        .attr('width', d => {
            let point = timePoint.find(t => t.name == d.time);
            return (point.order == 1 ? (timeLineRight(point.e) - timeLineRight(0)) : (timeLineRight(point.e) - timeLineRight((timePoint.find(n => n.order == point.order - 1).e))))
        })
        .style('fill', 'none').style('stroke', '#333').style('stroke-width', '1').style('opacity', .8)
    enterBubbleGroup.append('rect').attr('class', 'timelinetree')
        .attr('y', h * .2).attr('x', d => {
            let point = timePoint.find(t => t.name == d.time);
            return 150 + timeLineLeft(point.e)
        })
        .attr('height', '10px')
        .attr('data-name', d => `${slug(d.time)}`)
        .attr('width', d => {
            let point = timePoint.find(t => t.name == d.time);
            return (point.order == 1 ? (timeLineLeft(0) - timeLineLeft(point.e)) : (timeLineLeft((timePoint.find(n => n.order == point.order - 1).e)) - timeLineLeft(point.e)))
        })
        .style('fill', 'none').style('stroke', '#333').style('stroke-width', '1').style('opacity', .8)

    var merge = updateBubbleGroup.merge(enterBubbleGroup)
    merge.selectAll('.bubbleco2').attr('r', 0).transition().duration(1000).attr('r', d => Math.sqrt(d.trees / minTree) * R)
    merge.selectAll('.bubbletree').attr('r', 0).transition().duration(1000).attr('r', d => Math.sqrt(d.trees / 3) * 3)
}

// function drawall(data) {
//     var updateSeason = svg.selectAll('.season').data(data).enter().append('g').attr('class', 'season')
//         .attr('transform', (d, i) => `translate(0,${i * h})`).attr('id', d => d.key)
//     var updateTitle = updateSeason.append('text').attr('transform', `translate(${w / 2},${h * .9})`).style('text-anchor', 'middle')
//         .html(d => d.key)
//     var updateDes = updateSeason.append('text').attr('transform', `translate(${w / 2},${h * .1})`).style('text-anchor', 'middle')
//         .attr('id', d => d.key).html('<tspan><tspan> rides')
//     var updateBubbleGroup = updateSeason.selectAll('.timePoint').data(d => d.values).enter().append('g').attr('class', 'timePoint')
//     updateBubbleGroup.append('circle').attr('class', 'bubbleco2')
//         .attr('r', d => Math.sqrt(d.value.trees / 3) * 3)
//         .attr('cy', d => scaleRider(d.value.rides))
//         .attr('cx', d => { return w / 2 + timeLineRight(timePoint.find(n => n.name == d.key).e) })
//         .style('fill', '#999').style('opacity', .7)
//         .attr('data-name', d => `${slug(d.value.time)}co2`)
//     updateBubbleGroup.append('circle').attr('class', 'bubbletree')
//         .attr('r', d => Math.sqrt(d.value.trees / 3) * 3)
//         .attr('cy', d => scaleRider(d.value.rides))
//         .attr('cx', d => { return 150 + timeLineLeft(timePoint.find(n => n.name == d.key).e) })
//         .style('fill', '#618c77').style('opacity', .7)
//         .attr('data-name', d => `${slug(d.value.time)}`)
//     updateBubbleGroup.append('rect').attr('class', 'timelineco2')
//         .attr('y', h * .2).attr('x', d => {
//             let point = timePoint.find(t => t.name == d.value.time);
//             return point.order == 1 ? (w / 2 + timeLineRight(0)) : (w / 2 + timeLineRight(timePoint.find(n => n.order == point.order - 1).e))
//         })
//         .attr('height', '10px')
//         .attr('data-name', d => `${slug(d.value.time)}co2`)
//         .attr('width', d => {
//             let point = timePoint.find(t => t.name == d.value.time);
//             return (point.order == 1 ? (timeLineRight(point.e) - timeLineRight(0)) : (timeLineRight(point.e) - timeLineRight((timePoint.find(n => n.order == point.order - 1).e))))
//         })
//         .style('fill', 'none').style('stroke', '#333').style('stroke-width', '1').style('opacity', .8)
//     updateBubbleGroup.append('rect').attr('class', 'timelinetree')
//         .attr('y', h * .2).attr('x', d => {
//             let point = timePoint.find(t => t.name == d.value.time);
//             return 150 + timeLineLeft(point.e)
//         })
//         .attr('height', '10px')
//         .attr('data-name', d => `${slug(d.value.time)}`)
//         .attr('width', d => {
//             let point = timePoint.find(t => t.name == d.value.time);
//             return (point.order == 1 ? (timeLineLeft(0) - timeLineLeft(point.e)) : (timeLineLeft((timePoint.find(n => n.order == point.order - 1).e)) - timeLineLeft(point.e)))
//         })
//         .style('fill', 'none').style('stroke', '#333').style('stroke-width', '1').style('opacity', .8)



//     // timePoint.forEach(time => {
//     //     var circle = document.querySelector(`circle[data-name=${time.name.replace(' ','')}co2]`)
//     //     var circlesize = circle.getBBox()
//     //     var rect = document.querySelector(`rect[data-name=${time.name.replace(' ','')}co2]`)
//     //     var item = { startX: rect.x, startY: rect.y, endX: circle.x / 2, endY: circle.y }
//     //     console.log()
//     // })

//     // var updateLines = svg.selectAll('.link').data(data)
//     // var enterLines = updateLines.enter().append('line')
// }

function slug(data) {
    let newdata = data.replace(' ', '-')
    return newdata
}

function parse(d) {
    return {
        time: d.time,
        season: d.season,
        rides: +d.rides,
        duration: +d.totalDuration,
        trees: +d.trees
    }
}

function debounce(func, wait = 50, immediate = true) {

    var timeout;
    return function() {
        var context = this,
            args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};
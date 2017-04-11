var m = {t:10,r:10,b:10,l:10},
    w = document.getElementById('canvas').clientWidth - m.l - m.r,
    h = document.getElementById('canvas').clientHeight - m.t - m.b;

var plot = d3.select('.canvas')
    .append('svg')
    .attr('width', w )
    .attr('height', h + m.b )
    .append('g').attr('class','plot')
    // .attr('transform','translate('+ 0+','+ m.t+')');

var scalePeople = d3.scaleLinear()
    .range([0,w*1.5])
    .domain([0,1000]),
    scaleTreeY = d3.scaleLinear()
    .range([h*.62,40])
    .domain([0,100]),
    scaleTreeX = d3.scaleLinear()
    .range([0,w-200])
    .domain([0,100]),
    treeSelector = d3.scaleOrdinal()
    .range(['tree1','tree2','tree3','tree4','tree5'])
    // scaleVolumn = d3.scaleLinear()
    // .range([0,h])
    // .exponent(.9)
    

var isLoaded = false;
// var BySecond = JSON.parse(localStorage.getItem('BySecond')) || [];
var BySecond, MonDuration,nowMonStartDay;
var allMonth = [];
var weekTran = [{name:'Monday',num:1},
    {name:'Tuesday',num:2},
    {name:'Wedsday',num:3},
    {name:'Thursday',num:4},
    {name:'Friday',num:5},
    {name:'Saturday',num:6},
    {name:'Sunday',num:0}]
var monTran = [{name:'Jan',num:0},
    {name:'Feb',num:1},
    {name:'Mar',num:2},
    {name:'Apr',num:3},
    {name:'May',num:4},
    {name:'Jun',num:5},
    {name:'Jul',num:6},
    {name:'Aug',num:7},
    {name:'Sept',num:8},
    {name:'Oct',num:9},
    {name:'Nov',num:10},
    {name:'Dec',num:11}]
// people bar
var peoplebars = plot.append('g').attr('class','peoplebars')
    .attr('transform','translate('+25+','+(h-80) +')')
//add bicycle person
peoplebars.append('svg:image')
    .attr('class','bicycleimg')
    .attr('xlink:href',function(d){return 'img/bicycle.svg'})
    .attr('transform','translate(0,-5)')

//prepare person bar
var gradient = peoplebars.append('defs').append('linearGradient').attr('id','Gradient')
    .attr('x1','0%').attr('y1','0%').attr('x2','100%').attr('y2','0%')
    gradient.append('stop')
        .attr('offset','0%')
        .style('stop-color','#637158')
        .style('stop-opacity',1)
    gradient.append('stop')
        .attr('offset','100%')
        .style('stop-color','#637158')
        .style('stop-opacity',0.1)
peoplebars.append('rect')
    .attr('id','peoplebar')
    // .attr('x', 80)
    .attr('y', 80)
    .attr('width',0)
    .attr('height',10)
    .style('fill','url(#Gradient)')
//prepare number
peoplebars.append('text').text('0')
    .attr('id','peoplenumber')
    .attr('class','number')
    .attr('x',w*.15)
    .attr('y',40)
peoplebars.append('text').text('Rides')
    .attr('class','type')
    .attr('x',w*.15)
    .attr('y',70)
peoplebars.append('text').text('Carbon Savings of')
    .attr('class','carbonsaving')
    .attr('x',w*.15)

//hour tree number
var treenumber = plot.append('g').attr('class','treenumber')
    .attr('transform','translate('+w * .35+','+(h - 80) +')')
treenumber.append('text').text('0')
    .attr('id','treenumber') 
    .attr('class','number') 
    .attr('y',40)
treenumber.append('text').text('Trees')
    .attr('class','type')
    .attr('y',70)
treenumber.append('text').text('Carbon Savings of')
    .attr('class','carbonsaving')

//equal mark
var mark = plot.append('g').attr('class','marks')
    .attr('transform','translate('+(w * .25)+','+(h - 60) +')')
mark.append('text').text('=')
    .attr('class','marks')
    .attr('y',20)
//in word
var andIn = plot.append('g').attr('class','marks')
    .attr('transform','translate('+(w * .45)+','+(h - 60) +')')
andIn.append('text').text('in')
    .attr('class','andIn')
    .attr('y',20)
//clock
var clock = plot.append('g').attr('class','clock')
    .attr('transform','translate('+w*.55+','+(h-80)+')')
clock.append('text').text('')
    .attr('id','countTime')
    .attr('class','number') 
    .attr('y',40)
clock.append('text').text('')
    .attr('id','countDate')
    .attr('class','carbonsaving')
clock.append('text').text('')
    .attr('id','countWeek')
    .attr('y',70)
    .attr('class','type')

//get data
d3.queue()
    .defer(d3.csv,'data/trip.csv',parse)
    .await(dataloaded);

function dataloaded(err,July){
 // console.log(July.length)
MonDuration = d3.nest()
    .key(function(d){return d.mon})
    .rollup(function(leaves){
        return {
            'totalDuration': d3.sum(leaves, function(d) {return d.duration})
        }
    })
    .entries(July)
// console.table(MonDuration)
var MonStack = [], stackDuration = 0
MonDuration.forEach(function(d,i){
    var monName = d.key;
    var monDuration = d.value.totalDuration
    stackDuration = monDuration + stackDuration
    MonStack.push({name:monName,duration:monDuration,stack:stackDuration})
})

BySecond = d3.nest()
    .key(function(d){return d.hour})
    .sortKeys(d3.ascending)
    .rollup(function(leaves){
        // console.log(leaves)
        return {
        'duration':d3.sum(leaves,function(d){return d.duration}),
        'people':leaves.length,
        'data':leaves
    }})
    .entries(July);  
    // console.log(BySecond)
// localStorage.setItem('BySecond', JSON.stringify(BySecond))
nowMonStartDay = BySecond[0].key;
isLoaded = true;

}

// function drawBicycleBar(BySecondBicycle){
//     var updateBicycle = plot.selectAll('.bicycle')
//         .data(BySecondBicycle)
// console.log(BySecondBicycle)
//     var enterBicycle = updateBicycle.enter().append('g').attr('class','bicycle')

//     // var Bicycle = enterBicycle.append('svg:image')
//     //     .attr('class','bicycleimg')
//     //     .attr('xlink:href',function(d){return 'img/bicycle.svg'})
//     //     .attr('x',function(d,i){return scalePeople(i>35?(i-36):i)})
//     //     .attr('y',function(d,i){return i>30?h*.95:h*.9})

//     enterBicycle.append('rect')
//         .attr('x', w * .2 + 60)
//         .attr('y', h * .9)
//         .attr('width',function(d){return scalePeople(d.people)})
//         .attr('height',20)
        
// updateBicycle.exit().remove();
// }
function drawTree(Trees){
    // console.log(Trees)
    var updateTree = plot.selectAll('.trees').data(Trees)
    var enterTree = updateTree.enter().append('g').attr('class','trees')
        .attr('transform',function(d){return 'translate('+Math.round(scaleTreeX(d.locationX))+','+Math.round(scaleTreeY(d.locationY))+')'})
    TreeFront = enterTree.append('svg:image')
        .attr('class','treefrontimg')
        .attr('xlink:href',function(d){return d.img})      
        .style('opacity',0)
        .attr('height',function(d){return '180px' })
        .attr('width','180px')
        // .attr('id',function(d){})
    // TreeBack = enterTree.append('svg:image')
    //     .attr('class','treebackimg')
    //     .attr('xlink:href',function(d){return d.img})
    //     .style('opacity',.3)
    //     .attr('height','100px')
    //     .attr('min-width','100px')
    enterTree.merge(updateTree)
        .select('.treefrontimg')
        // .attr('height',function(d){return 100 * d.percentage +'px' })
        .style('opacity',function(d){return d.percentage})
updateTree.exit().remove();
}

//calculate grams from duration
function grams(duration){
    return duration * 0.00267 * 411;
}
function selectTree(BySecondTree,secondsForDays){
    // var countDays = secondsForDays / 3600 / 24;
    var countDays = 1 / 24;
    var countTree = grams(BySecondTree) / (16000 * countDays);
    if(countTree == undefined){countTree = 1}
    var howManyTree = Math.ceil(countTree)
    // console.log('howmany tree:'+countTree);
    // console.log('howmany grams from cycle:'+grams(BySecondTree));
    // console.log('how many day'+countDays)
    var trees = []
    var randomLocationX,randomLocationY;
    for(i=0;i<howManyTree;i++){
        var treehref = 'img/'+treeSelector(Math.round(Math.random() * 10))+'.svg';
        var percentage;
         randomLocationX = Math.round(Math.random() * 100);
         randomLocationY = Math.round(Math.random() * 100);
        if(i == howManyTree-1){
            percentage = countTree - Math.floor(countTree);
        }else{
            percentage = 1;
        }

        trees.push({img:treehref,percentage:percentage,locationX:randomLocationX,locationY:randomLocationY})
    }
    return trees
}
var interval = 500;
var t = 0, BySecondTree, nextMonIndex = 1,nextMonth;
    

var timer = setInterval(run, interval);
function run(){
    updateData(t);
    t ++
}
// clearInterval(timer);
function updateData(t){
    // console.log('haha')
if(isLoaded){
    d3.select('#landding').remove()
    var BySecondBicycle = BySecond[t].value.data.length;
    //update people bar
    d3.select('#peoplebar').transition().duration(500).attr('width',scalePeople(BySecondBicycle))
    //update people count number
    d3.select('#peoplenumber').text(BySecondBicycle)

    //update clock
    var nowDate = new Date(BySecond[t].value.data[0].time)
    var nowHour = nowDate.getHours()<10?('0'+nowDate.getHours()):nowDate.getHours()
    // var nowTime = nowDate.getMinutes()<10?('0'+nowDate.getMinutes()):nowDate.getMinutes()
    var nowDay = nowDate.getDate()
    var nowYear = nowDate.getFullYear()
    var nowMon = monTran.find(function(d){return d.num == nowDate.getMonth()}).name
    var nowWeek = weekTran.find(function(d){return d.num == nowDate.getDay()}).name
    d3.select('#countDate').text(nowMon+' '+nowDay+' , '+nowYear)
    d3.select('#countTime').text(nowHour+':00')
    d3.select('#countWeek').text(nowWeek)
    //update tree number
    var showTree = Math.ceil(grams(BySecondTree) / (16000 / 24))
    if(!showTree){showTree = '<1'}
    d3.select('#treenumber').text(showTree)

    //set next month
    nextMonth = allMonth[nextMonIndex];
    // console.log(allMonth[nextMonIndex-1])

    //update month
    if(BySecond[t].value.data[0].mon == nextMonth){
        d3.select('#mon'+allMonth[nextMonIndex-1]).style('fill','#637158')
        d3.select('#monbarCover'+allMonth[nextMonIndex-1]).transition().duration(1500).attr('height',0)
        BySecondTree = 100;
        nextMonIndex++;
        nextMonth = allMonth[nextMonIndex]
        nowMonStartDay = BySecond[t].key;
    }
    // BySecondTree =  BySecondTree + BySecond[t].value.duration;
    BySecondTree =  BySecond[t].value.duration;

    // console.log('how many mill duration till now'+BySecondTree)
    // var secondsForDays = (BySecond[t].key - nowMonStartDay) / 1000 + 1;
    // console.log('how many seconds till start'+secondsForDays)

    // var Trees = selectTree(BySecondTree,secondsForDays)
    var Trees = selectTree(BySecondTree)
    drawTree(Trees)
    }
}

function parse(d,i){
var month = new Date(d['starttime']).getFullYear() * 100 + new Date(d['starttime']).getMonth() + 1;
    if( !allMonth.includes(month) ){
        allMonth.push(month);
    }
    return {
        duration: +d['tripduration'],
        time: new Date(d['starttime']).getTime(),
        mon: new Date(d['starttime']).getFullYear() * 100 + new Date(d['starttime']).getMonth() + 1,
        // mon: month
        // date:new Date(d['starttime']),
        // min:new Date(d['starttime']) - new Date(d['starttime']).getSeconds()*1000,
        hour:new Date(d['starttime']) - new Date(d['starttime']).getMinutes()*60000-new Date(d['starttime']).getSeconds()*1000,
    }
}
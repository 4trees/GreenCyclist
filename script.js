var m = {t:50,r:50,b:50,l:50},
    w = document.getElementById('canvas').clientWidth - m.l - m.r,
    h = document.getElementById('canvas').clientHeight - m.t - m.b;

var plot = d3.select('.canvas')
    .append('svg')
    .attr('width', w + m.l + m.r)
    .attr('height', h + m.t + m.b)
    .append('g').attr('class','plot')
    .attr('transform','translate('+ 0+','+ m.t+')');

var scalePeople = d3.scaleLinear()
    .range([30,w*.95])
    .domain([0,35]),
    scaleTreeY = d3.scaleLinear()
    .range([h*.6,0])
    .domain([0,100]),
    scaleTreeX = d3.scaleLinear()
    .range([10,w-50])
    .domain([0,100]),
    treeSelector = d3.scaleOrdinal()
    .range(['tree1','tree2','tree3','tree4','tree5'])

var isLoaded = false;
var BySecond, MonDuration;
var allMonth = [];


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

BySecond = d3.nest()
    .key(function(d){return d.hour})
    .sortKeys(d3.ascending)
    .rollup(function(leaves){
        // console.log(leaves)
        return {
        'duration':d3.sum(leaves,function(d){return d.duration}),
        'data':leaves
    }})
    .entries(July);  
    // console.log(BySecond.length)
isLoaded = true;

}
// plot.append('text').text('ride mile per hour = trees are planted in city')
//             // .attr('translate','transform('+w/2+','+(h-20)+')')
//             .attr('x',w-100)
//             .attr('y',h+20)
//             .style('fill','#666')
//             .style('font-size','.7em')
function drawBicycle(BySecondBicycle){
    var updateBicycle = plot.selectAll('.bicycle')
        .data(BySecondBicycle)

    var enterBicycle = updateBicycle.enter().append('g').attr('class','bicycle')

    var Bicycle = enterBicycle.append('svg:image')
        .attr('class','bicycleimg')
        .attr('xlink:href',function(d){return 'img/bicycle.svg'})
        .attr('x',function(d,i){return scalePeople(i>35?(i-36):i)})
        .attr('y',function(d,i){return i>30?h*.95:h*.9})
        
updateBicycle.exit().remove();
}
function drawTree(Trees){
    console.log(Trees)
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
function selectTree(BySecondTree,days){
    var countDays = days / 1000 / 3600 / 24;
    var countTree = grams(BySecondTree) / (16000 * countDays);
    var howManyTree = Math.ceil(countTree)
    console.log('howmany tree:'+countTree);
    // console.log('howmany grams from cycle:'+grams(BySecondTree));
    console.log('how many day'+countDays)
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

        trees.push({'img':treehref,'percentage':percentage,'locationX':randomLocationX,'locationY':randomLocationY})
    }
    return trees
}
var interval = 800;
var t = 0, BySecondTree = 1000, nextMonIndex = 1,nextMonth, nowMonStartDay;

var timer = setInterval(function(){
    updateData(t);
    t ++
}, interval);
// clearInterval(timer);
function updateData(t){
    // console.log('haha')
if(isLoaded){
    // console.log('ready');
    // if(t > BySecond.length){clearInterval(timer)}
    let BySecondBicycle = BySecond[t].value.data;
    nextMonth = allMonth[nextMonIndex];
    nowMonStartDay = BySecond[0].key;
    console.log(allMonth[nextMonIndex-1])
    if(BySecond[t].value.data[0].mon == nextMonth){
        BySecondTree = 1000;
        nextMonIndex++;
        nextMonth = allMonth[nextMonIndex]
        nowMonStartDay = BySecond[t].key;
    }
    BySecondTree =  BySecondTree + BySecond[t].value.duration;
    console.log('how many mill second till now'+BySecondTree)
    var days = BySecond[t].key - nowMonStartDay + 1000;
    console.log('duration second'+days)
    var Trees = selectTree(BySecondTree,days)
    drawBicycle(BySecondBicycle)
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
var timePoint = [
	{name:'sunrise',time:[[3,0],[5,59]],order:1,seconds:2 * 3600 + 59 * 60 + 59},
	{name:'early AM',time:[[6,0],[6,59]],order:2,seconds: 59 * 60 + 59},
	{name:'AMPeak',time:[[7,0],[8,59]],order:3,seconds:3600 + 59 * 60 + 59},
	{name:'middayBase',time:[[9,0],[13,29]],order:4,seconds:4 * 3600 + 29 * 60 + 59},
	{name:'middaySchool',time:[[13,30],[15,59]],order:5,seconds: 2 * 3600 + 29 * 60 + 59},
	{name:'PMPeak',time:[[16,0],[18,29]],order:6,seconds:2*3600 + 29 * 60 + 59},
	{name:'evening',time:[[18,30],[21,59]],order:7,seconds:3 * 3600 + 29 * 60 + 59},
	{name:'lateEvening',time:[[22,0],[23,59]],order:8,seconds:1 * 3600 + 59 * 60 + 59},
	{name:'night',time:[[0,0],[2,59]],order:9,seconds:2 * 3600 + 59 * 60 + 59}
	]
console.log('timePeriod: ',timePoint)
var seasonPoint = [
	{name:'spring',range:[3,4,5]},
	{name:'summer',range:[6,7,8]},
	{name:'autumn',range:[9,10,11]},
	{name:'winter',range:[12,1,2]}]

var	file = '../beautiful/data/trip.csv';

d3.queue()
  .defer(d3.csv,file,parse)
  .await(dataloaded);

function dataloaded(err, trips){
trips.sort(function(x, y){
   return d3.ascending(timePoint.find(function(d){return d.name == x.point}).order, timePoint.find(function(d){return d.name == y.point}).order);
})
console.log('Raw data: ',trips)
const tripsByseason = d3.nest()
	.key(function(d){return d.point})
	.key(function(d){return d.season})
	.rollup(function(l){
		let totalDuration = d3.sum(l,function(el){return el.duration})
		let timeSecond = timePoint.find(function(el){return el.name == l[0].point}).seconds
		return {
		rides:l.length,
		totalDuration:totalDuration,
		treeCount: totalDuration * 0.00267 * 411 / (16000 / 24 / 60 / 60 * timeSecond)}})
	.entries(trips)
console.log('nested: ',tripsByseason)
console.log('formulation of tree count: totalDuration * 0.00267 * 411 / (16000 / 24 / 60 / 60 * secondsOfThisTimeperiod)')
draw(tripsByseason)

}
function draw(data){
// Duration * 0.00267 * 411 = total grams | 20 km/h (12.4274 mile/hour: 0.00345 mile/sec)
// 16000 / 24 / 60 / 60  = grams per second
}


function parse(d){
var date = new Date(d['starttime'].replace(/-/g, "/"));
var refDate = new Date(date)
var mon = date.getMonth() + 1;

var point = timePoint.find(function(t){
	var start = refDate.setHours(t.time[0][0],t.time[0][1],0)
	var end = refDate.setHours(t.time[1][0],t.time[1][1],59)
	return date >= new Date(start) && date <= new Date(end)}).name;
var season = seasonPoint.find(function(s){
	return s.range.includes(mon)}).name;
return{
    duration: +d.tripduration,
    starttime: date.getTime(),
    season: season,
    point: point
  }
}
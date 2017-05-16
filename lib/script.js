var here = 'HERE!'

var data = {}
var events = {}
var debug = false
var counter

function replaceNames (note) {
	var out = note
	var namelist = note.match(/\{[^\}]+\}/g)
	if (namelist) {
		for (var i=0;i<namelist.length;i++) {
			namelist[i] = namelist[i].replace(/\{|\}/g,'')
			var name = namelist[i].split(':')
			out = out.replace('{'+namelist[i]+'}', getName('',name[0],name[1],true))
			}
		return out
		}
	return note
	}


function toggleMinimal (node) {
	var i
	//var ps = document.querySelectorAll('.record p, pre, details, .figure')
	var ps = document.querySelectorAll('.record p, .figure')
	if (node.textContent === 'Minimise') {
		for (i=0;i<ps.length;i++) if (ps[i].className !== 'recordTitle' && ps[i].parentNode.id !== 'summary') ps[i].style.display = 'none'
		node.textContent = 'Normal'
		localStorage.ancestryMinimise = 'yes'
		} 
	else {
		for (i=0;i<ps.length;i++) ps[i].style.display = 'block'
		node.textContent = 'Minimise'
		localStorage.ancestryMinimise = 'no'
		}
	}

function upperCaseFirst (str) { 
	if (str !== '') return str[0].toUpperCase()+str.substr(1)
	else return ''
	}

function summarise (node) {
	document.getElementById('summaryWin').style.display = 'block'
	var out = '</p><button style="background-color:#706b63; color:white; font-size: 1.2em; border:0; border-radius: 1em; float: right;" onclick="this.parentNode.style.display=\'none\'">Close</button>'
	out += '<p>'
	out += document.getElementById('gotoTop').outerHTML.replace('>Top','>Detail')+' &bull; '+ document.getElementById('gotoTree').outerHTML
	var records = document.querySelectorAll('.recordDate, .recordTitle, .keypoints, .discn')
	for (var i=0;i<records.length;i++) {
		if (records[i].className.match('recordDate')) out += '<br/>\t</p><p>'
		if (records[i].className.match('keypoints') && records[i].textContent !== '') {
			out += '<br/>'
			var occ = records[i].querySelector('.occ')
			var place = records[i].querySelector('.place')
			if (occ) out += upperCaseFirst(occ.textContent)
			if (occ && place) out += ', '
			if (place) out += place.textContent
			}
		else if (records[i].className.match('recordTitle')) out += '<br/>'+upperCaseFirst(records[i].textContent)+' '
		else if (records[i].className.match('discn')) out += '<br/>'+upperCaseFirst(records[i].textContent)+' '
		else out += records[i].textContent +' '
		}
	if (document.getElementById('places')) out += '<br/>'+document.getElementById('places').outerHTML
	out += '</p><button style="background-color:#706b63; color:white; font-size: 1.2em; border:0; border-radius: 1em;" onclick="this.parentNode.style.display=\'none\'">Close</button>'
	
	//console.log(out)
	document.getElementById('summaryWin').innerHTML = out
	}

function hideNotes () {
	var ps = document.querySelectorAll('.record p, .figure')
	for (var i=0;i<ps.length;i++) {
		if (ps[i].className !== 'recordTitle' && ps[i].parentNode.id !== 'summary') ps[i].style.display = 'none'
		}
	}

function unHideNotes () {
	var ps = document.querySelectorAll('.record p, pre, details')
	for (var i=0;i<ps.length;i++) {
		ps[i].style.display = 'block'
		}
	}

function addFIcon (text, type) {
	var parts, out
	if (text) {
		if (type === 'gps') {
			parts = text.split('http')
			out = '<a target="_blank" class="gpslink" href="http'+parts[1]+'"><img src="lib/i/map.png" alt="'+parts[0]+'" title="'+parts[0]+'"/></a>'
			return out.replace(/§/,':')
			}
		if (type === 'record') {
			parts = text.split('url:')
			out = '<a target="_blank" href="'+window.project+'/'+parts[1]+'"><img src="lib/i/record.png" alt="'+parts[0]+'" title="'+parts[0]+'"/></a>'
			return out
			}
		if (type === 'link') {
			if (text.match(/url:/)) {
				parts = text.split('url:')
				out = '<a target="_blank" href="'+window.project+'/'+parts[1]+'"><img src="lib/i/info.png" alt="'+parts[0]+'" title="'+parts[0]+'"/></a>'
				}
			else if (text.match(/https:/)) { 
				parts = text.split('https:')
				out = '<a target="_blank" href="https:'+parts[1]+'"><img src="lib/i/info.png" alt="'+parts[0]+'" title="'+parts[0]+'"/></a>'
				}
			else { 
				parts = text.split('http:')
				out = '<a target="_blank" href="http:'+parts[1]+'"><img src="lib/i/info.png" alt="'+parts[0]+'" title="'+parts[0]+'"/></a>'
				}
			return out
			}
		}
	}


function getDatePhrase (date, year) {
	if (!date) date = ''
	if (date.match(/by/)) return date+' '+year
	if (date.match(/onob|ca/)) {
		if (date.match(/\d/)) return date.replace(/onob|ca/,'on or before')+' '+year
		else return date.replace(/onob|ca/,'in or before')+' '+year
		}
	if (date.match(/abt|~/)) return date.replace(/abt|~/,'around ')+' '+year
	if (date.match(/bef|</)) return date.replace(/bef|</,'before')+' '+year
	if (date.match(/aft|>/)) return date.replace(/aft|>/,'after')+' '+year

	if (date && year) {
		if (date.match(/\d/)) return ' on '+date+' '+year
		else return ' in '+date+' '+year
		}
	else if (year) {
		if (year.match(/abt|~/)) return 'around '+year.replace(/abt|~/,'')
		if (year.match(/bef|\</)) return 'before '+year.replace(/bef|\</,'')
		if (year.match(/bef|\>/)) return 'after '+year.replace(/bef|\>/,'')
		return ' in '+year
		}
	}


function getAge (phrase1, eDate, eYear, bDate, bYear, phrase2) {
	if (eYear.trim() === '' || bYear.trim() === '?' || bYear.trim() === '') return ''
	
	if (bDate === '?' || bDate === '') bDate = '1 Jul'
	if (eDate === '?' || eDate === '') eDate = '1 Jul'

	if (! eDate.match(/[0-9]/)) eDate = '1 '+eDate
	if (! bDate.match(/[0-9]/)) bDate = '1 '+bDate
	
	eDate = eDate.replace(/by|bef|aft|abt|onob|~|\*|\<|\>|,/, '')
	bDate = bDate.replace(/by|bef|aft|abt|onob|~|\*|\<|\>|,/, '')
	eYear = eYear.replace(/by|bef|aft|abt|onob|~|\*|\<|\>|,/, '')
	bYear = bYear.replace(/by|bef|aft|abt|onob|~|\*|\<|\>|,/, '')
	
	eDate = eDate.replace(/\-.../, '')
	bDate = bDate.replace(/\-.../, '')
	
	var age = parseInt(eYear) - parseInt(bYear)
	if (age < 0) return phrase1+age+phrase2
	var eTime = new Date( eDate + ' 2000' )
	var bTime = new Date(bDate + ' 2000' )
	if (eTime < bTime) age--
	if (age < 0) age = 0
	
	return phrase1+age+phrase2
	}



function getName (phrase, id, part, uselink) {
	// part identifies the format of the name: g, given; k, knownas; f,family, mX,married where X indicates which married name
	if (! db[id]) return id
	if (part.match('x')) { part=part.replace('x',''); uselink = false }  // shortcut for in page names
	var person = db[id]
	if (part === 'given') part = 'g'; if (part === 'both') part = 'gf'; // legacy code
	var startTag, endTag, givenname, g, k, f, m
	g = k = f = m = ''
	startTag = endTag = ''
	if (uselink && person) { 
		if (person.p) startTag = '<a href="person.html?project='+project+'&person='+id+'"'
		else startTag = '<a href="tree.html?project='+project+'&person='+id+'" class="treeLink" '
		startTag += '>'; endTag = '</a>' 
		}

	if (person.k) k = person.k
	else k = person.g
	g = person.g
	f = person.f
	m = person.m

	if (part === 'g') return startTag+g+endTag
	if (part === 'gf') return startTag+g+' '+f+endTag
	if (part === 'k') return startTag+k+endTag
	if (part === 'kf') return startTag+k+' '+f+endTag
	if (part === 'kg') {
		if (g === k) return startTag+g+endTag
		else return startTag+k+' ('+g+') '+endTag
		}
	if (part === 'gkf') {
		if (g === k) return startTag+g+' '+f+endTag
		else return startTag+g+' ('+k+') '+f+endTag
		}
	if (part === 'gfm') {
		var temp = ''
		if (person.m) {
			for (var i=0;i<person.m.length;i++) temp += ' ('+person.m[i]+')'
			}
		return startTag+g+' '+f+' '+temp+endTag
		}
	if (part === 'kfm') {
		var temp = ''
		if (person.m) {
			for (var i=0;i<person.m.length;i++) temp += ' ('+person.m[i]+') '
			}
		return startTag+k+' '+f+' '+temp+endTag
		}
	else return ' '+id+' '
	}



function getParents (phrase, info) {
	var out = ''
	if (info.fid || info.mid) out += phrase
	if (info.mid) out += getName('',info.mid,'k',true)
	if (info.fid && info.mid) out += ' &amp; '
	if (info.fid) out += getName('',info.fid,'gkf',true)
	return out
	}


function getDBParents (phrase, person) { 
	var out = ''
	if (db[person].father || db[person].mother) out += phrase
	if (db[person].mother && db[db[person].mother]) out += getName('',db[person].mother,'k',true)
	else if (db[person].mother) out += db[person].mother
	if (db[person].father || db[person].mother) out += ' &amp; '
	if (db[person].father && db[db[person].father]) out += getName('',db[person].father,'gkf',true)
	else if (db[person].father) out += db[person].father
	return out
	}


function toggleDetails (node) {
	var i
	var details = document.querySelectorAll('details')
	if (node.textContent === 'Expand details') {
		for (i=0;i<details.length;i++) details[i].open = 'open'
		node.textContent = 'Hide details'
		localStorage.ancestryExpandDetail = 'yes'
		}
	else {
		for (i=0;i<details.length;i++) details[i].open = ''
		node.textContent = 'Expand details'
		localStorage.ancestryExpandDetail = 'no'
		}
	}


function toggleRelatives (node) {
	var i
	var details = document.querySelectorAll('.other')
	if (node.textContent === 'Hide relatives') {
		for (i=0;i<details.length;i++) details[i].parentNode.style.display = 'none'
		node.textContent = 'Show relatives'
		localStorage.ancestryHideRelatives = 'yes'
		}
	else {
		for (i=0;i<details.length;i++) details[i].parentNode.style.display = 'flex'
		node.textContent = 'Hide relatives'
		localStorage.ancestryHideRelatives = 'no'
		}
	}


function toggleHistoryOLD (node) {
	var i
	var details = document.querySelectorAll('.event')
	if (node.textContent === 'Hide history') {
		for (i=0;i<details.length;i++) details[i].parentNode.style.display = 'none'
		node.textContent = 'Show history'
		localStorage.ancestryHideHistory = 'yes'
		}
	else {
		for (i=0;i<details.length;i++) details[i].parentNode.style.display = 'flex'
		node.textContent = 'Hide history'
		localStorage.ancestryHideHistory = 'no'
		}
	}


function toggleEvents (node) {
	var i
	var details = document.querySelectorAll('.event')
	if (node.textContent === 'Hide events') {
		for (i=0;i<details.length;i++) details[i].parentNode.style.display = 'none'
		node.textContent = 'Show events'
		localStorage.ancestryHideHistory = 'yes'
		}
	else {
		for (i=0;i<details.length;i++) details[i].parentNode.style.display = 'flex'
		node.textContent = 'Hide events'
		localStorage.ancestryHideHistory = 'no'
		}
	}


function toggleHistory (node, dob) {
	//console.log(node, dob, years.length,'years')
	var records, years, theYear, nextYear, i
	
	if (node.textContent === 'Hide history') {
		years = document.querySelectorAll('.history')
		for (i=0;i<years.length;i++) years[i].outerHTML = ''
		node.textContent = 'Show history'
		localStorage.ancestryHideHistory = 'yes'
		}
	else {
		var ptr = dob
		years = document.querySelectorAll('.dateAndRecord')
		for (i=1;i<years.length;i++) {
			//console.log(ptr, years[i].querySelector('.theYear'))
			if (years[i].querySelector('.theYear') === null) continue
			theYear = parseInt(years[i].querySelector('.theYear').textContent.replace('~',''))
			if (years[i+1] && years[i+1].querySelector('.theYear') !== null) nextYear = parseInt(years[i+1].querySelector('.theYear').textContent.replace('~',''))
			else  nextYear = theYear
			if (nextYear === theYear) continue
			//console.log('year',theYear,'ptr',ptr)
			while (ptr !== theYear && ptr < theYear) {
				//console.log('in ptr sub: year',theYear,'ptr',ptr)
				var age = ptr-parseInt(dob)
				if (h[ptr]) {
					insertedNode = years[i].parentNode.insertBefore(document.createElement('div'), years[i])
					insertedNode.outerHTML = '<div class="dateAndRecord history"><div><div class="recordDate"><span class="theYear">'+ptr+'</span></div></div><div class="record  event"><div class="titleEtc"><p class="recordTitleAge">'+age+'</p><p class="recordTitle"></p></div><div class="descriptionText"><p>'+h[ptr]+'</p></div><pre>&nbsp;</pre></div><div class="keypoints kpevent"><div></div></div></div>'
					}
				ptr++
				}
			var age = theYear-parseInt(dob)
			if (h[theYear]) years[i].outerHTML += '<div class="dateAndRecord history"><div><div class="recordDate"><span class="theYear">'+theYear+'</span></div></div><div class="record  event"><div class="titleEtc"><p class="recordTitleAge">'+age+'</p><p class="recordTitle"></p></div><div class="descriptionText"><p>'+h[theYear]+'</p></div><pre>&nbsp;</pre></div><div class="keypoints kpevent"><div></div></div></div>'
			ptr = theYear+1
			}
		node.textContent = 'Hide history'
		localStorage.ancestryHideHistory = 'no'
		}
	}


// ==================================================================================================================
// ================================================ MAIN FUNCTION ===================================================
// ==================================================================================================================


function redisplay (everything, id, summary) { 
	var out = ''
	var re, pron, refpron, posspron, f, i, n, c, j, d, p, x, temp
		
	var records = everything.split('§')
	var given, fullname, text, born, bdate, id, male
	var occ = ''
	var gps = []
	var thumb = ''
	var thumbLegend = ''
	
	// get the general information
	var person = db[id]
	
	var fid = person.father
	var mid = person.mother
	var sid = []
	var cid = []
	if (person.fg) {
		for (i=0;i<person.fg.length;i++) {
			sid.push(person.fg[i][1])
			}
		for (i=0;i<person.fg.length;i++) {
			for (j=2;j<person.fg[i].length;j++) {
				cid.push(person.fg[i][j])
				}
			}
		}

	
	var dob = id.split('_')
	out += '<div id="topMenu" style="text-align:right;">'
	out += '<a id="gotoTop" href="#top">Top</a>'
	out += '<span id="summarise" onclick="summarise(this)">Summarise</span>'
	out += '<span id="toggleDetails" onclick="toggleDetails(this)">Expand details</span>'
	out += '<span id="toggleEvents" onclick="toggleHistory(this, '+dob[dob.length-1]+')">Show history</span>'
	out += '<span id="toggleRelatives" onclick="toggleRelatives(this)">Hide relatives</span>'
	//out += '<span id="minimiseToggle" onclick="addHistory(this, '+dob[dob.length-1]+')">Show history</span>'
	out += '<a id="gotoTree" href="tree.html?person='+id+'&project='+window.project+'">Tree</a>'
	out += '<a style="margin-right:3em;" href="index.html?project='+project+'">Index</a> '
	out += '</div>'
	out += '<div id="top"></div>'
	
	
	// popup window for summary
	out += '<div style="position:absolute; background-color:white; margin:auto;padding: 2em;border:1px solid #ccc;border-radius:1em;display:none; max-width:40%;" id="summaryWin"></div>'
	
	// establish some basic information about the person the page is about
	given = getName('', id, 'k', false)
	fullname = getName('', id, 'gkf', false)
	male = person.male
	born = person.b
	if (data[id] && data[id].birth && data[id].birth.date) bdate = data[id].birth.bdate
	else if (person.bdate) bdate = person.bdate
	else bdate = '' 
	if (male) { pron = 'He'; refpron = 'himself'; posspron = 'His'; }
	else  { pron = 'She'; refpron = 'herself'; posspron = "Her"; }
	temp = thumb.split(',')
	if (temp.length>1) { thumb = temp[0]; thumbLegend = temp[1]; }
	else thumbLegend = fullname
	
	
	// set the page title
	document.querySelector('title').textContent = getName('', id, 'gf', false)
	
	// draw top banner
	out += '<div id="banner"><div id="pagetitle">'+getName('', id, 'gf', false)+'<br><span id="bannerdates">'+person.b+'\u2013'+person.d
	if (person.occ) out += ' \u2022 '+person.occ
	out += '</span></div></div>'
	
	// list parents
	out += '<div id="subbanner"><div>Parents: '
	if (fid) out += getName('', fid, 'both', true)
	if (mid && fid ) out += ' \u2022 '
	if (mid) out += getName('', mid, 'both', true)
	if (!mid && !fid) out += 'Unknown'
	out += ' </div></div>'

	// list spouses
	out += '<div id="subsubbanner"><div>Spouse: '
	if (sid.length > 0) {
		for (c=0;c<sid.length;c++) {
			out += getName('', sid[c], 'both', true)
			if (c<sid.length-1) out += ' \u2022 '
			}
		}
	else out += 'None'
	out += '</div></div>'

	// list children
	out += '<div id="subsubsubbanner"><div>Children: '
	temp = []
	if (cid.length > 0) {
		for (c=0;c<cid.length;c++) {
			if (cid[c] === 'a_child') {
				temp.push('<span>Private</span>')
				}
			else if (cid[c] === 'noissue') {}
			else {
				temp.push('<span>'+getName('', cid[c], 'given', true)+'</span>')
				}
			}
		}
	for (i=0;i<temp.length;i++) {
		out += temp[i]
		if (i<temp.length-1) out += ' \u2022 '
		}

	if (temp.length === 0) out += 'None'
	out += '</div></div>'

	// display the general information
	out += '<div id="main">'
	out += '<div class="dateAndRecord">'
	out += '<div id="summary" class="record"><div><p>'
	//out += '<div class="dateAndRecord"><div><div class="recordDate"><span style="font-size: 100%; margin-top:.8em;">'+person.b+'-</span><span>'+person.d+'</span></div></div><div id="summary" class="record"><div><p>'
	if (person.thumb) out += '<img class="portrait" src="'+project+'/thumbs/'+id+'.jpg" alt="'+thumbLegend+'" title="'+thumbLegend+'">'
	else if (person.male) out += '<img class="portrait" src="lib/i/man_pic.png" alt="'+thumbLegend+'" title="'+thumbLegend+'">'
	else  out += '<img class="portrait" src="lib/i/woman_pic.png" alt="'+thumbLegend+'" title="'+thumbLegend+'">'
	
	// create the life summary
	if (data[id] && data[id].intro) summary.innerHTML = data[id].intro
	else {
		var intro = getName('', id, 'gfm', false)
		if (db[id].k) intro += ', known as '+db[id].k+', '
		if (db[id].b) intro += ' was born in '+db[id].b
		if (db[id].bplace) intro += ' at '+db[id].bplace
		intro += '. '
		if (db[id].fg) {
			for (i=0;i<db[id].fg.length;i++) {
				intro += pron+' married '+getName('', db[id].fg[i][1], 'gf', false)+' in '+db[id].fg[i][0]
				if (db[id].fg[i].length > 2) {
					intro += ' and they had '
					if (db[id].fg[i].length === 3) intro += ' one child'
					else intro += db[id].fg[i].length-2+' children'
					}
				else intro += ' but we have no record of any children'
				intro += '. '
				}
			}
		if (db[id].occ) {
			var occupations = db[id].occ.split(',')
			intro += posspron+' occupations included '
			for (i=0;i<occupations.length;i++) {
				if (i === occupations.length-1 && i>0) intro += ' and '
				if (i>1) intro += ', '
				intro += occupations[i]
				}
			intro += '. '
			}
		if (db[id].d) {
			intro += pron+' died in '+db[id].d
			if (db[id].dplace) intro += ' at '+db[id].dplace
			var ed = ey = bd = by = '?'
			if (db[id].b) intro += getAge(' aged ', db[id].ddate, db[id].d, db[id].bdate, db[id].b, '')
			intro += '. '
			intro = intro.replace('~',' about ')
			}
		intro += '</p>\n'
		if (db[id].cstatus) intro += '<p style="color:#aaa; text-align:center;margin-top:1em;">– '+db[id].cstatus+' –</p>'
		summary.innerHTML = intro
		}
	out += summary.innerHTML+'</div></div><div class="keypoints">'
	
	// add the general links
	if (data[id] && data[id].links) {
		for (i=0;i<data[id].links.length;i++) {
			out += '<p><a href="'+data[id].links[i].url+'" target="_blank">'+data[id].links[i].title+'</a></p>'
			}
		}

	else out += ' '
	out += '</div></div>\n'


	
	// WORK THROUGH EACH RECORD +++++++++++++++++++++++++++++++++++++++++++++++++++++++
	for (i=1;i<records.length;i++) {
		var record = ''
		var info = { }
		info.date = '' // sets default for age calculation
		var fields = records[i].split('\n')
		//console.log(fields[0])
		
		// read in the first line
		fields[0] = fields[0].replace(/ [\s]+/g, ' ')
		var firstline = fields[0].split(' ')
		var year = firstline[1]
		var who = firstline[2]
		var what = ''
		if (firstline[3]) what = firstline[3]
		var background = ''
		var border = ''
		//var relations = false
		var usegps = false
		// for census, notes, events, and background create a title row with the title info
		if (what && who.match(/census/i)) { fields.splice(1,0,'title: '+fields[0].replace(/.... census/i,'').trim()); what = '' }
		if (what && who.match(/notes/i)) { fields.splice(1,0,'title: '+fields[0].replace(/.... notes/i,'').trim()); what = '' }
		if (what && who.match(/background/i)) { fields.splice(1,0,'title: '+fields[0].replace(/.... background/i,'').trim()); what = '' } 
		if (what && who.match(/event/i))  continue // { fields.splice(1,0,'event: '+fields[0].replace(/.... event/i,'').trim()); what = '' } 
		 
		if (what && who === 'notes') { fields.splice(1,0,'title: '+what) } // for Notes ....
		if (what && what === 'born') { fields.splice(1,0,'birth: '+firstline[4]); what = 'birth' } // for X born id
		if (what && what === 'dies') { fields.splice(1,0,'death: '+firstline[4]); what = 'death' } // for X dies id
		if (what && what === 'marries') { fields.splice(1,0,'marriage:'+firstline[4]); what = 'marriage' } // for X dies id
		if (! who.match(/son|daughter|husband|wife|spouse|birth|marriage|death|census|notes/i))  { background = ' other' }
		if (who.match(/birth|marriage|death|census|notes/i) || 
			(who.match(/son|daughter/i) && what.match(/birth/i)) || 
			(who.match(/wife|husband/i) && what.match(/death/i)))  { usegps = true; }
		if (who.match(/marriage/i)) {
			background = ' marriage'; 
			if (what) fields.splice(1,0,'marriage:'+what) // for Marriage id
			}
		if (who.match(/death/i)) background = ' death'
		if (who.match(/event/i)) background = ' event'
		if (what && what.match(/death/i)) background += ' familydeath'
		if (who.match(/figure/i)) background = ' figure'



		var details = ''
		info.children = {}
		info.children = 0
		info.others = 0
		info.visitors = 0
		info.serv = 0
		info.notes = []
		info.fnotes = []
		info.siblings = []
		info.title = ''
		var theLink
		var floatedIcons = ''
	
	
	
	
	
		// WORK THROUGH EACH FIELD
		for (f=1;f<fields.length;f++) {
			fields[f] = fields[f].trim()
			fields[f] = fields[f].replace(/:\s*/,'§')
			
			
			if (fields[f] !== '' && fields[f].substr(-1) !== '§') {
						
			

			// split the label from the data
			var parts = fields[f].trim().split('§')
			parts[0] = parts[0].trim()
			parts[1] = parts[1].trim()


			// get links for floated icons
			if (parts[0] === 'record') floatedIcons += addFIcon(parts[1],'record')
			if (parts[0] === 'gps') floatedIcons += addFIcon(parts[1],'gps')
			if (parts[0] === 'link') floatedIcons += addFIcon(parts[1],'link')

			// turn patterns of text+url into links
			if (parts[1].match(' http')) {
				theLink = parts[1].split('http')
				parts[1] = '<a target="_blank" href="http'+theLink[1].trim()+'">'+theLink[0]+'</a>'
				}
			if (parts[1].match('url:')) {
				theLink = parts[1].split('url:')
				parts[1] = '<a target="_blank" href="'+window.project+'/'+theLink[1].trim()+'">'+theLink[0]+'</a>'
				}
			
			// convert url{} to relative urls
			if (parts[1].match('url{')) {
				re = new RegExp("url{([^}]+)}","g")
				parts[1] = parts[1].replace(re, '<a target="_blank" href="$1">$1</a>');
				}
	
			// convert @{} to absolute urls
			if (parts[1].match('@{')) {
				re = new RegExp("@{([^ ]+) ([^}]+)}","g")
				parts[1] = parts[1].replace(re, '<a target="_blank" href="http://$1">$2</a>');
				}
	
			// convert link{} to relative urls
			if (parts[1].match('link{')) {
				re = new RegExp("link{([^ ]+) ([^}]+)}","g")
				parts[1] = parts[1].replace(re, '<a target="_blank" href="$1">$2</a>');
				}
	
			// convert q{} to markup
			if (parts[1].match('q{')) {
				re = new RegExp("q{([^}]+)}","g")
				parts[1] = parts[1].replace(re, '<q>$1</q>');
				}
	
			// collect new info
			var censusline
			switch (parts[0]) {
				 case 'birth':  info.id = parts[1].trim()
				 				otherPerson = data[parts[1].trim()]
								if (otherPerson) {
									//fields.push('date§'+otherPerson.bdate)
									if (db[info.id] && db[info.id].bdate) fields.push('date§'+db[info.id].bdate)
				 					if (otherPerson.birth) for (x=0;x<otherPerson.birth.length;x++) fields.push(otherPerson.birth[x])
									}
								break
				 case 'marriage':
				 				var mData = []
								var spIds = parts[1].trim().split('+')
								if (spIds.length === 1) spIds.unshift(id)
								if (data[spIds[0]] && data[spIds[0]].marriages && data[spIds[0]].marriages[spIds[1]]) mData = data[spIds[0]].marriages[spIds[1]]
								else if (data[spIds[1]] && data[spIds[1]].marriages && data[spIds[1]].marriages[spIds[0]]) mData = data[spIds[1]].marriages[spIds[0]]
								if (mData.length > 0) for (x=0;x<mData.length;x++) fields.push(mData[x])
								
								// do the following if there is no detailed info (gets data from db)
								else {
									if (db[spIds[0]].male) mData = ['gid: '+spIds[0], 'bid: '+spIds[1]]
									else mData = ['bid: '+spIds[0], 'gid: '+spIds[1]]
									for (x=0;x<mData.length;x++) fields.push(mData[x])
									}
								
								break
				 case 'death':   
				 				info.id = parts[1].trim()
				 				otherPerson = data[info.id]
								if (db[info.id] && db[info.id].ddate) fields.push('date§'+db[info.id].ddate)
				 				if (otherPerson && otherPerson.death) for (x=0;x<otherPerson.death.length;x++) fields.push(otherPerson.death[x])
								break
				 case 'event':   
				 				//info.id = parts[1].trim()
				 				//otherPerson = events[info.id]
				 				//if (otherPerson) for (x=0;x<otherPerson.length;x++) fields.push(otherPerson[x])
								break
								
				 case 'title': info.title = parts[1]; break
				 case 'link': info.link = parts[1]; break
				 
				 case 'fid': info.fid = parts[1].trim(); break
				 case 'mid': info.mid = parts[1].trim(); break
				 case 'formerly': info.formerly = parts[1]; break
				 case 'focc': info.focc = parts[1]; break
				 case 'date': info.date = parts[1]; break
				 case 'bapplace': info.bapplace = parts[1]; break
				 case 'bapdate': info.bapdate = parts[1]; break
				 case 'bapyear': info.bapyear = parts[1]; break
				 case 'place': info.place = parts[1]; break
				 case 'of': info.of = parts[1]; break
				 case 'gid': info.gid = parts[1].trim(); break
				 case 'gage': info.gage = parts[1]; break
				 case 'gocc': info.gocc = parts[1]; break
				 case 'gfather': info.gfather = parts[1].trim(); break
				 case 'gfid': info.gfid = parts[1].trim(); break
				 case 'gfocc': info.gfocc = parts[1]; break
				 case 'bid': info.bid = parts[1].trim(); break
				 case 'bage': info.bage = parts[1]; break
				 case 'bocc': info.bocc = parts[1]; break
				 case 'bfather': info.bfather = parts[1].trim(); break
				 case 'bfid': info.bfid = parts[1].trim(); break
				 case 'bfocc': info.bfocc = parts[1]; break
				 case 'bstatus': info.bstatus = parts[1]; break
				 case 'gstatus': info.gstatus = parts[1]; break
				 case 'bparish': info.bparish = parts[1].trim(); break
				 case 'gparish': info.gparish = parts[1].trim(); break
				 case 'length': info.length = parts[1]; break
				 case 'by': info.by = parts[1]; break
				 case 'witnesses': info.witnesses = parts[1]; break
				 case 'age': info.age = parts[1]; break
				 case 'head': censusline = parts[1].split(','); info.head = censusline[0]; break
				 case 'wife': censusline = parts[1].split(','); info.wife = censusline[0]; break
				 case 'child': info.children++;  break
				 case 'relation': info.relation = parts[1]; break
				 case 'other': info.others = info.others+1; break
				 case 'serv': info.serv = info.serv+1; break
				 case 'visitor': info.visitors = info.visitors+1; break
				 case 'siblings': info.siblings = parts[1].split(','); break
				 case 'text': info.text = parts[1]; break
				 case 'cause': info.cause = parts[1].trim(); break
				 case 'occ': info.occ = parts[1].trim(); break
				 case 'informant': info.informant = parts[1].trim(); break
				 case 'iocc': info.iocc = parts[1].trim(); break
				 case 'iplace': info.iplace = parts[1].trim(); break
				 case 'gravestone': info.gravestone = parts[1].trim(); break
				 case 'burplace': info.burplace = parts[1].trim(); break
				 case 'burdate': info.burdate = parts[1].trim(); break
				 case 'probate': info.probate = parts[1].trim(); break
				 case 'obit': info.obit = parts[1].trim(); break
				 case 'note': info.notes.push( parts[1] ); fields[f] = ''; break
				 case 'fnote': info.fnotes.push( parts[1] ); fields[f] = ''; break
				 case 'quote': info.notes.push( '<q>'+parts[1]+'</q>' ); fields[f] = ''; break
				 case 'img': info.img= parts[1]; break
				 case 'caption': info.caption= parts[1]; break
				 case 'gps': 
				 		if (usegps) {
				 		temp=''
						for (p=1;p<parts.length;p++) temp+=parts[p]
						gps.push( temp )
						} 
						break
				}

			// collect information for display in the details section
			if (parts[0] === 'note' || parts[0] === 'quote') {} // do nothing where the note will be displayed in main text
			else if (parts[0] === 'title') {} // do nothing for title info
			else if (parts[0] === 'source') details += '<img src="lib/i/source.png" alt="Source link" title="Source link"/>'+parts[1]+"\n"
			else if (parts[0] === 'record') details += '<img src="lib/i/record.png" alt="Link to a record" title="Link to a record"/>'+parts[1]+"\n"
			else if (parts[0] === 'media') details += '<img src="lib/i/media.png" alt="Link to media" title="Link to media"/>'+parts[1]+"\n"
			else if (parts[0] === 'gps') details += '<img src="lib/i/map.png" alt="Show on Google Maps" title="Show on Google Maps"/>'+parts[1]+"\n"
			else if (parts[0] === 'discussion') details += '<img src="lib/i/discn.png" alt="Things to consider" title="Things to consider"/><span class="discn">'+parts[1]+"</span>\n"
			else if (parts[0] === 'documents' || parts[0] === 'link') details += '<img src="lib/i/info.png" alt="More information" title="More information"/>'+parts[1]+"\n"
			else details += parts[0]+': '+parts[1]+"\n"
		
			}
			}
		


		// make the title
		var title = ''
		var type = ''
		var namedother = false
		if (who && who.match(/brother|sister|grandfather|grandmother|daughter|son/i))  namedother = true
		if (namedother) { 
			if (what && what.toLowerCase() === 'death') { title = who+' '+getName('', info.id, 'k', false)+' dies'; type = 'familydeath'; }
			//else if (what && what.toLowerCase() === 'birth') { title = who+' '+getName('', info.id, 'k', false)+' born'; type = 'familybirth'; }
			else if (what && what.toLowerCase() === 'birth') { title = getName('', info.id, 'k', false)+' born'; type = 'familybirth'; }
			else if (what && what.toLowerCase() === 'marriage') { 
				//if (who.toLowerCase() === 'daughter' || who.toLowerCase() === 'sister') title = who+' '+getName('', info.bid, 'k', false)+' marries'+' '+getName('', info.gid, 'kf', false) 
				//else title = who+' '+getName('', info.gid, 'k', false)+' marries'+' '+getName('', info.bid, 'kf', false) 
				if (who.toLowerCase() === 'daughter' || who.toLowerCase() === 'sister') title = getName('', info.bid, 'k', false)+' marries'+' '+getName('', info.gid, 'kf', false) 
				else title = getName('', info.gid, 'k', false)+' marries'+' '+getName('', info.bid, 'kf', false) 
				type = 'familymarriage'; }
			else { title = who; type = who.toLowerCase(); }
			}
		else if (what) { 
			if (what && what.toLowerCase() === 'death') { title = who+' dies'; type = 'familydeath'; }
			else if (what && what.toLowerCase() === 'birth') { title = who+' born'; type = 'familybirth'; }
			else if (what && what.toLowerCase() === 'marriage') { title = who+' marries'; type = 'familymarriage'; }
			else { title = who; type = who.toLowerCase(); }
			}
		else if (who.toLowerCase() === 'marriage') {
			if (male) title = 'Marriage to '+getName('', info.bid, 'kf', false)
			else title = 'Marriage to '+getName('', info.gid, 'kf', false)
			type = 'marriage'
			}
		//else { title = who+info.title; type = who.toLowerCase(); }
		else if (who.toLowerCase() === 'birth' || who.toLowerCase() === 'death') { title = who; type = who.toLowerCase(); }
		// else if (who.toLowerCase() === 'census') { title = 'Census: '+info.title; type = who.toLowerCase(); }
		else if (who.toLowerCase() === 'census') { title = 'Census'; type = who.toLowerCase(); }
		else { title = info.title; type = who.toLowerCase(); }
		
		
		// add the record title and any floating icons
		record += '<div class="titleEtc">\n'
		if (type !== 'background') record += '<p class="recordTitleAge">'+getAge('', info.date, year, bdate, born, '')+'</p>'
		record += '<p class="recordTitle">'+title+'</p>'
		record += '</div>\n'
		
		
		// create the summary text
		record += '<div class="descriptionText">'
		switch (type) {
			case 'Person': 
					record += '<p>'+text+'</p>'
					break
					
			case 'familybirth': 
					record += '<p>'
					if (male) record += 'His '; else record += 'Her '
					record += who.toLowerCase() +' '
					record += getName('', info.id, 'kg', true)
					record += ' was born '
					if (db[info.id] && db[info.id].bdate) record += getDatePhrase(db[info.id].bdate,year)
					else if (data[info.id] && data[info.id].birth && data[info.id].birth.date) record += getDatePhrase(data[info.id].birth.date,year)
					else record += getDatePhrase('',year)
					if (info.place) record += ' at '+info.place;
					record += getAge(', when '+given+' was ', info.date, year, bdate, born, ' years old')
					record += '.</p>'
					if (info.focc) {
						if (male) record += '<p>'+given+'\'s '; else record += '<p>'+getName('', info.id, 'kx', true)+'\'s father\'s '
						record += ' occupation at the time was '+info.focc+'.</p>'
						}
					if (info.notes.length > 0) for (n=0;n<info.notes.length;n++) { record += '<p>'+replaceNames(info.notes[n])+'</p>' }
					break
					
			case 'familymarriage': 
					record += '<p>'
					if (who.toLowerCase() === 'daughter') { 
						record += given+'\'s daughter '+getName('', info.bid, 'kg', true)+' married '+getName('', info.gid, 'gkf', true)+getDatePhrase(info.date,year)
						if (info.place) record += ' at '+info.place
						record += '. </p>'
						}
					if (who.toLowerCase() === 'son') {
						record += given+'\'s '+who.toLowerCase()+' '+getName('', info.gid, 'given', true)+' married '+getName('', info.bid, 'both', true)+getDatePhrase(info.date,year)
						if (info.place) record += ' at '+info.place
						record += '. </p>'
						}
					if (who.toLowerCase() === 'father') {
						record += given+'\'s '+who.toLowerCase()+' '+getName('', info.gid, 'given', true)+' married '+getName('', info.bid, 'both', true)+getDatePhrase(info.date,year)
						if (info.place) record += ' at '+info.place
						record += '. </p>'
						}
					if (who.toLowerCase() === 'mother') {
						record += given+'\'s '+who.toLowerCase()+' '+getName('', info.bid, 'given', true)+' married '+getName('', info.gid, 'both', true)+getDatePhrase(info.date,year)
						if (info.place) record += ' at '+info.place
						record += '. </p>'
						}
			
					if (who.toLowerCase() === 'daughter' && info.gfid) {
						record += '<p>The father of the groom was '+getName('', info.gfid, 'both', true)
						if (info.gfocc) record += ', '+info.gfocc
						record += '. '
						if (info.bfocc) record += ' The occupation of '+getName('', info.bfid, 'both', true)+' was '+info.bfocc+'. '
						record += '</p>'
						}
					if (who.toLowerCase() === 'son' && info.bfid) {
						record += '<p>The father of the bride was '+getName('', info.bfid, 'both', true)
						if (info.bfocc) record += ', '+info.bfocc
						record += '. '
						if (info.gfocc) record += ' The occupation of '+getName('', info.gfid, 'both', true)+' was '+info.gfocc+'. '
						record += '</p>'
						}
					if (info.notes.length > 0) for (n=0;n<info.notes.length;n++) { record += '<p>'+replaceNames(info.notes[n])+'</p>' }
					break
					
			case 'familydeath': 
					record += '<p>'
					record += posspron+' '+who.toLowerCase() +' '
					switch (who.toLowerCase()) {
						case 'grandfather':
						case 'grandmother': record += getName('', info.id, 'kfm', true); break
						default: record += getName('', info.id, 'k', true)
						}
					if (info.cause && info.cause.match(/killed/i)) record += ' was killed '
					else record += ' passed away '
					if (data[info.id] && data[info.id].death && data[info.id].death.date) record+= getDatePhrase(data[info.id].death.date,year)
					else if (db[info.id] && db[info.id].ddate) record+= getDatePhrase(db[info.id].ddate,year)
					else record+= getDatePhrase('',year)
					if (info.age) record += ', aged '+info.age+', '
					if (info.place) record += ' at '+info.place+', ';
					record += getAge(' when '+given+' was ', info.date, year, bdate, born, ' years old.')
					if (info.cause) record += ' '+getName('', info.id, 'given', true)+'\'s cause of death was '+info.cause+'. '
					record += '</p>'
					if (info.informant) record += '<p>The informant was '+info.informant+'.</p>'
					if (info.notes.length > 0) for (n=0;n<info.notes.length;n++) { record += '<p>'+replaceNames(info.notes[n])+'</p>' }
					break
					
					
			case 'birth':
					// check whether this is the baptism date
					if (db[info.id] && db[info.id].bdate) info.date = db[info.id].bdate
					else info.date = ''
					var goingByBap = false
					if (info.date && info.bapdate && info.date.match('~') && info.date.replace('~','') === info.bapdate) {
						goingByBap = true
						info.date = info.date.replace('~','onob ')
						}
					record += '<p>'+fullname+' was born '+getDatePhrase(info.date,year)
					if (goingByBap) {
						record += ' (the date of '+posspron.toLowerCase()+' baptism)'
						}
					if (info.place) record += ' at '+info.place
					record += getDBParents(', to ', id); 
					record += '.'
					if (db[id].mother && db[db[id].mother]  && db[db[id].mother].f) {
						record += ' '+posspron+' mother\'s maiden name was '+db[db[id].mother].f+'.' 
						}
					if (info.informant) {
						record += ' The informant on the birth certificate was '+info.informant+'.' 
						}
					if (info.focc) {
						record += ' '+posspron+' father\'s occupation was '+info.focc+'.' 
						}
					record += '</p>'
					if (info.siblings.length > 0) {
						if (info.siblings.length === 1) record += '<p>'+pron+' had an elder sibling, '+getName('', info.siblings[0].trim(), 'given', true)+'.</p>'
						else {
							record += '<p>'+pron+' had '+info.siblings.length+' elder siblings: '
							for (n=0;n<info.siblings.length;n++) {
								record += getName('', info.siblings[n].trim(), 'given', true)
								if (n === info.siblings.length-2) record += ' and '
								else if (n<info.siblings.length-1) record += ', '
								}
							record += '.</p>'
							}
						}
					
					if (info.bapdate) {
						record += '<p>'+given+' was baptised '
						if (! goingByBap) {
							if (info.bapyear) record += getDatePhrase(info.bapdate,info.bapyear)
							else record += getDatePhrase(info.bapdate,year)
							}
						if (info.bapplace) record += ' at '+info.bapplace+'.'
						record += '</p>'
						}
					if (info.notes.length > 0) for (n=0;n<info.notes.length;n++) { record += '<p>'+replaceNames(info.notes[n])+'</p>' }
					if (info.fnotes.length > 0) {
						record += '<div class="footnotes"><p>Notes</p><ol>'
						for (n=0;n<info.fnotes.length;n++) record += '<li>'+info.fnotes[n]+'</li>'
						record += '</ol></div>'
						}
					break
			case 'marriage': 
					record += '<p>'+given+' married '
					if (male) record += getName('', info.bid, 'gkf', true)
					else record += getName('', info.gid, 'both', true)
					record += ' at '+info.place+', '
					if (info.date) record+= getDatePhrase(info.date,year)
					if (male) pron = 'he'; else pron = 'she'
					record += getAge(' when '+pron+' was ', info.date, year, bdate, born, ' years old')
					record += '. '
					
					if (info.bage || info.bstatus || info.gocc || info.bocc || info.bparish || info.gparish) record += '<p>'
					if (male) {
						if (info.bage) record += 'The bride was '+info.bage+' years old'
						if (info.bage && info.bstatus) record += ' and a '+info.bstatus
						else if (info.bstatus) record += ' The bride was a '+info.bstatus
						if (info.bage || info.bstatus) record += '. '
						}
					else {	
						if (info.gage) record += ' The groom was '+info.gage+' years old'
						if (info.gage && info.gstatus) record += ' and a '+info.gstatus
						else if (info.gstatus) record += ' The groom was a '+info.gstatus
						if (info.gage || info.gstatus) record += '. '
						}
					
					if (info.gocc) record += getName('', info.gid, 'k', true)+'\'s occupation was '+info.gocc+'. '
					if (info.bocc) record += getName('', info.bid, 'k', true)+'\'s occupation was '+info.bocc+'. '
				
					if (info.bparish && info.bparish === info.gparish) {
						if (info.gparish==='otp') record += ' Both were of this parish. '
						else record += ' Both were living at '+info.bparish+'. '
						}
					else {
						if (info.bparish) {
							if (info.bparish==='otp') record += ' The bride was of this parish'
							else record += ' The bride was from '+info.bparish
							}
						if (info.gparish && info.bparish) record += ' and the '
						else if (info.gparish) record += '. The '
						if (info.gparish) {
							if (info.gparish==='otp') record += ' groom was of this parish'
							else record += ' groom was from '+info.gparish
							}
						if (info.bparish || info.gparish) record += '. '
						}
					if (info.bage || info.bstatus || info.gocc || info.bocc || info.bparish || info.gparish) record += '</p>'
					if (info.bfid || info.gfid) record += '<p>'
					if (male) {
						if (info.bfid) record += ' The bride\'s father was '+getName('', info.bfid, 'gf', true)
						else if (info.bfather) record += ' The bride\'s father was '+info.bfather
						if (info.bfocc) record += ', and his occupation '+info.bfocc
						if (info.bfid || info.bfather) record += '. '
						if (info.gfocc) record += given+'\'s father\'s occupation was '+info.gfocc+'. '
						}
					else {
						if (info.gfid) record += ' The groom\'s father was '+getName('', info.gfid, 'gf', true)
						else if (info.gfather) record += ' The groom\'s father was '+info.gfather
						if (info.gfocc) record += ', and his occupation '+info.gfocc
						if (info.gfid || info.gfather) record += '. '
						if (info.bfocc) record += given+'\'s father\'s occupation was '+info.bfocc+'. '
						}
					if (info.bfid || info.gfid) record += '</p>'
					
					if (info.by && info.witnesses) record += '<p>They were married by '+info.by+' and the witnesses were '+info.witnesses+'.<p>'
					else { 
						if (info.by) record += '<p>They were married by '+info.by+'.<p>'
						if (info.witnesses) record += '<p>Witnesses were '+info.witnesses+'.<p>'
						}
					//if (info.length) record += '<p>They were to be married for '+info.length+'.</p>'
					console.log('death dates', db[info.bid].d, db[info.gid].d)
					if (db[info.bid] && db[info.gid] && db[info.bid].d && db[info.gid].d) {
						var marrLength = Math.min(db[info.bid].d, db[info.gid].d) - year
						if (marrLength < 1) record += '<p>They were to be married for less than a year.</p>'
						else if (marrLength === 1) record += '<p>They were to be married for about a year.</p>'
						else record += '<p>They were to be married for around '+marrLength+' years.</p>'
						}
					if (info.notes.length > 0) for (n=0;n<info.notes.length;n++) { record += '<p>'+replaceNames(info.notes[n])+'</p>' }
					if (info.fnotes.length > 0) {
						record += '<div class="footnotes"><p>Notes</p><ol>'
						for (n=0;n<info.fnotes.length;n++) record += '<li>'+info.fnotes[n]+'</li>'
						record += '</ol></div>'
						}
					break

			case 'census': 
					record += '<p>On '+info.date+' '+year+', '+given+getAge(' (aged ', info.date, year, bdate, born, ')')
					record += ' was at '+info.place+'. '
					if (info.head) {
						record += ' The household included '
						if (info.relation && info.relation === 'head') record += ' '+refpron
						else if (info.relation && info.relation === 'wife') record += ' her husband '+getName('',info.head,'kf',true)
						else record += getName('',info.head,'kfm',true)
						if (! info.wife && info.children === 0) record += ''
						else if (info.wife && info.children === 0) record += ' and '
						else if (info.wife) record += ','
						if (info.wife) {
							if (info.relation && info.relation === 'wife') record += ' '+refpron
							else record += ' his wife '+getName('',info.wife,'k',true)
							}
						if (info.wid && info.wid === id) record += ' ('+refpron+')'
						if (info.children) {
							if (info.children === 1) { record += ' and 1 child'; if (info.relation === 'child') record += ' ('+refpron+')' }
							else { record += ' and '+info.children+' children'; if (info.relation === 'child') record += ' (including '+refpron+')' }
							}
						record += '. '
						if (info.others || info.visitors) {
							record += ' There '
							if (info.others) {
								if (info.others === 1) { record += ' was also 1 other'; if (info.relation === 'other') record += ' ('+refpron+')' }
								else if (info.others) { record += ' were '+info.others+' others'; if (info.relation === 'other') record += ' (including '+refpron+')' }
								}
							if (info.others && info.visitors) record += ' and there '
							if (info.visitors) {
								if (info.visitors === 1) { record += ' was also 1 visitor'; if (info.relation === 'visitor') record += ' ('+refpron+')' }
								else if (info.visitors) { record += ' were also '+info.visitors+' visitors'; if (info.relation === 'visitor') record += ' (including '+refpron+')' }
								}
							record += '.'
							}
						if (info.serv) {
							record += ' There '
							if (info.serv === 1) { record += ' was also 1 servant'; if (info.relation === 'serv') record += ' ('+refpron+')' }
							else if (info.serv) { record += ' were '+info.serv+' servants'; if (info.relation === 'serv') record += ' (including '+refpron+')' }
							record += '.'
							}
						record += '</p>'
						}
					else {
						record += ' The household contained '+eval(info.others+info.children)+' people'
						record += ' including '+given
						if (info.children === 1)  record += ' and one child'
						else if (info.children > 0) record += ' and '+posspron.toLowerCase()+' '+info.children+' children'
						record += '. '
						}
					if (info.notes.length > 0) for (n=0;n<info.notes.length;n++) { record += '<p>'+replaceNames(info.notes[n])+'</p>' }
					if (info.fnotes.length > 0) {
						record += '<div class="footnotes"><p>Notes</p><ol>'
						for (n=0;n<info.fnotes.length;n++) record += '<li>'+info.fnotes[n]+'</li>'
						record += '</ol></div>'
						}
					break
					
			case 'death': 
					// check whether this is the burial date
					if (db[info.id] && db[info.id].ddate) info.date = db[info.id].ddate
					else info.date = ''
					var goingByBur = false
					if (info.date && info.burdate && info.date.match('~') && info.date.replace('~','') === info.burdate) {
						goingByBur = true
						info.date = info.date.replace('~','onob ')
						}
					record += '<p>'+getName('', id, 'kfm', false)
					if (info.of) record += ' of '+info.of
					record += ' died '+getDatePhrase(info.date,year)
					if (goingByBur) {
						record += ' (the date of '+posspron.toLowerCase()+' burial)'
						}
					if (info.place) record += ' at '+info.place
					if (male) pron = 'he'; else pron = 'she'
					record += getAge(' when '+pron+' was ', info.date, year, bdate, born, ' years old')
					record += '. '
					if (info.cause) record += ' The cause was '+info.cause+'. '
					if (info.occ) {
						if (male) record += ' His '; else record += ' Her '
						record += ' occupation at the time was '+info.occ.toLowerCase()+'. '
						}
					record += '</p>'
					if (info.informant) record += '<p>The informant was '+info.informant+'.</p>'

					if (info.burdate || info.burplace) {
						if (male) record += '<p>He '; else record += '<p>She '
						record += ' was buried at '+info.burplace
						if (! goingByBur && info.burdate) record += getDatePhrase(info.burdate,year)
						record += '.</p>'
						}
					if (info.gravestone) {
						if (male) record += '<p>His '; else record += '<p>Her '
						record += ' gravestone reads: <q>'+info.gravestone+'</q>.</p>'
						}
					if (info.probate) record += '<p>The probate index says: <q>'+info.probate+'</q>.</p>'
					if (info.obit) record += '<p>Obituary: <q>'+info.obit+'</q>.</p>'
					if (info.notes.length > 0) for (n=0;n<info.notes.length;n++) { record += '<p>'+replaceNames(info.notes[n])+'</p>' }
					if (info.fnotes.length > 0) {
						record += '<div class="footnotes"><p>Notes</p><ol>'
						for (n=0;n<info.fnotes.length;n++) record += '<li>'+info.fnotes[n]+'</li>'
						record += '</ol></div>'
						}
					break
					
			case 'residence': for (d=0;d<info.notes.length;d++) record += '<p>'+info.notes[d]+'</p>'; break
			case 'notes': 
				for (d=0;d<info.notes.length;d++) record += '<p>'+replaceNames(info.notes[d])+'</p>'; 
				break
			case 'event': /*for (d=0;d<info.notes.length;d++) record += '<p>'+info.notes[d]+'</p>';*/ break
			case 'background': 
					for (d=0;d<info.notes.length;d++) record += '<p>'+info.notes[d]+'</p>'; break
			case 'figure': record += '<figure><p><a href="'+window.project+'/'+info.img+'" target="_blank"><img src="'+window.project+'/'+info.img+'" alt=""/></a></p>'
						record += '<figcaption>'+info.caption+'</figcaption></figure>'
						break
			}
		record += '</div>\n'
			
		// draw age + year 
		out += '<div class="dateAndRecord"><div><div class="recordDate"'
		if (type === 'background' || type === 'figure') out += ' style="background-color:transparent;">'
		else out += '><span class="recordDateAge">'+getAge('', info.date, year, bdate, born, '')+'</span><span class="recordDateAge" style="font-size:1px;line-height:1px;"> &bull; </span><span class="theYear">'+year+'</span>'
		
		out += '</div></div><div class="record '+border+background+'">' + record
		if (type !== 'background' && type !== 'figure') out += '<details><summary></summary><pre>'+details+'</pre></details>'
		out += '</div>\n'
		
		// draw the key points summary
		out += '<div class="keypoints kp'+type+'">'
		if (type === 'familybirth' && (who.toLowerCase() === 'son' || who.toLowerCase() === 'daughter')) { 
			if (info.focc && male) out += '<div class="occ">'+info.focc+'</div>'; 
			if (info.place) out += '<div class="place">'+info.place+'</div>' }
		else if (type === 'census') { if (info.occ) out += '<div class="occ">'+info.occ+'</div>'; out += '<div class="place">'+info.place+'</div>' }
		else if (type === 'birth') { out += '<div class="place">'+info.place+'</div>' }
		else if (type === 'death') { if (info.occ) out += '<div class="occ">'+info.occ+'</div>'
			if (info.of) out += '<div class="place">'+info.of+'</div>'; else if (info.place) out += '<div class="place">'+info.place+'</div>'; }
		else if (type === 'marriage') { 
			if (male) { if (info.gocc) out += '<div class="occ">'+info.gocc+'</div>'; if (info.gparish) out += '<div class="place">'+info.gparish+'</div>' }
			else { 
				if (info.bocc) out += '<div class="occ">'+info.bocc+'</div>'; if (info.bparish) out += '<div class="place">'+info.bparish+'</div>' 
				}						
			}
		else if (type === 'familymarriage') {
			if (who.toLowerCase() === 'son') { if (info.gfocc) out += '<div class="occ">'+info.gfocc+'</div>' }
			if (who.toLowerCase() === 'daughter') { if (info.bfocc) out += '<div class="occ">'+info.bfocc+'</div>' }
			}
		else if (type === 'notes') { if (info.occ) out += '<div class="occ">'+info.occ+'</div>'; if (info.place) out += '<div class="place">'+info.place+'</div>' }
		if (type === 'familydeath') { 
			if (info.iocc) out += '<div class="occ">'+info.iocc+'</div>'; if (info.iplace) out += '<div class="place">'+info.iplace+'</div>' }
		else out += '<div></div>'
		if (floatedIcons) out += '<p class="floatedIcons">'+floatedIcons+'</p>'
		out += '</div>'

		out += '</div>\n'
		}
		
		
		// create a list of places
		
		// normalise the list
		for (i=0;i<gps.length;i++) gps[i] = gps[i].replace(/ [\s]+/g,' ')
		
		// remove duplicates
		temp = []
		for (i=0;i<gps.length;i++) {
			var found = false
			for (j=0;j<temp.length;j++) {
				if (gps[i] === temp[j]) { found = true; break }
				}
			if (! found) temp.push(gps[i])
			}
		gps = temp
		
		// add the list
		out += '<div id="places">'
		if (gps.length > 0) out +='<p class="placesTitle">Places</p>'
		for (i=0;i<gps.length;i++) out += '<p>'+gps[i]+'</p>'
		
		// crate a link to the map
		var param = ''
		for (i=0;i<gps.length;i++) {
			if (i>0) param += '|'
			// console.log(gps[i])
			temp = gps[i].replace('<a target="_blank" href="https://maps.google.com/maps?q=','')
			temp = temp.replace('<a target="_blank" href="http://maps.google.com/maps?q=','')
			temp = temp.replace('<a target="_blank" href="http//maps.google.com/maps?q=','')
			temp = temp.replace('</a>','')
			temp = temp.replace(',','§')
			temp = temp.replace('">','§')
			// console.log(temp)
			param += temp
			}
		out += '<p><a href="map.html?locations='+param+'" target="_blank">View all on map</a></p>'
		
		out += '</div>'
		out += '</div>'
	return out
}






function checkBMD (individual) {
	var person = db[individual]
	var out = ''
	var i, j, k, parent
	
	
	// initialise list of records
	records = []
	var sibling, siblingType, year, spouse, marriageList, child, childType, byear, dyear
	
	
	// get birth
	if (person.b) {
		records.push('§ '+person.b+' Birth')
		records.push('birth: '+individual)
		}
	
	// get birth & death years
	var birth = person.b.replace('~','')
	if (birth === '') {
		var temp = individual.split('_')
		birth = temp[temp.length-1]
		}
	var death = person.d.replace('~','')
	if (death === '') {
		if (person.upto) death = person.upto
		else {
			death = parseInt(birth) + 80
			death = death.toString()
			}
		}
		
	// get siblings
	if (db[person.father]) parent = db[person.father]
	else if (db[person.mother]) parent = db[person.mother]
	if (parent && parent.fg) { 
		for (var i=0;i<parent.fg.length;i++) {
			for (var j=2;j<parent.fg[i].length;j++) {
				if (db[parent.fg[i][j]]) {
					sibling = parent.fg[i][j]
					if (db[sibling].male) siblingType = 'brother'
					else siblingType = 'sister'
					//console.log(sibling)
					if (db[sibling].b && db[sibling].b !== '') byear = db[sibling].b.replace('~','')
					else byear = ''
					if (db[sibling].d && db[sibling].d !== '') dyear = db[sibling].d.replace('~','')
					else dyear = ''
					}
				if (byear >= birth && byear < death && sibling !== individual) records.push('§ '+db[sibling].b+' '+siblingType+' born '+sibling)
				if (dyear >= birth && dyear < death && sibling !== individual) records.push('§ '+db[sibling].d+' '+siblingType+' dies '+sibling)
				}
			}
		}

	// get marriage
	if (person.fg) {
		for (i=0;i<person.fg.length;i++) {
			records.push('§ '+person.fg[i][0]+' Marriage')
			records.push('marriage: '+person.fg[i][1])
			}
		}

	// get spouse death
	if (person.fg) {
		for (i=0;i<person.fg.length;i++) {
			var spouse = person.fg[i][1]
			var str = ''
			if (db[spouse] && db[spouse].d) {
				year = cleanYear(db[spouse].d)
				str += '§ '+db[spouse].d
				if (db[spouse].male) str += ' husband'
				else str += ' wife'
				str += ' dies '+spouse
				if (year < death) records.push(str)
				}
			}
		}

	// get children
	if (person.fg) { 
		for (i=0;i<person.fg.length;i++) {
			for (j=2;j<person.fg[i].length;j++) {
				if (db[person.fg[i][j]]) {
					child = person.fg[i][j]
					if (db[child].male) childType = 'son'
					else childType = 'daughter'
					records.push('§ '+db[child].b+' '+childType+' born '+child)
					}
				if (db[child].d) {
					//console.log(cleanYear(db[child].d), death)
					if (cleanYear(db[child].d) < death) records.push('§ '+db[child].d+' '+childType+' dies '+child)
					}
				}
			}
		}

	// get parents death
	if (db[person.father]) { 
		if (db[person.father].d) {
			year = cleanYear(db[person.father].d)
			if (year >= birth && year < death) records.push('§ '+year+' father dies '+person.father)
			}
		}
	if (db[person.mother]) { 
		if (db[person.mother].d) {
			year = cleanYear(db[person.mother].d)
			if (year >= birth && year < death) records.push('§ '+year+' mother dies '+person.mother)
			}
		}


	// get grandparents death
	var gparent
	if (db[person.father]) { 
		if (db[person.father].father && db[db[person.father].father] && db[db[person.father].father].d) {
			year = cleanYear(db[db[person.father].father].d)
			if (year >= birth && year < death) records.push('§ '+year+' grandfather dies '+db[person.father].father)
			}
		if (db[person.father].mother && db[db[person.father].mother] && db[db[person.father].mother].d) {
			year = cleanYear(db[db[person.father].mother].d)
			if (year >= birth && year < death) records.push('§ '+year+' grandmother dies '+db[person.father].mother)
			}
		}
	if (db[person.mother]) { 
		if (db[person.mother].father && db[db[person.mother].father] && db[db[person.mother].father].d) {
			year = cleanYear(db[db[person.mother].father].d)
			if (year >= birth && year < death) records.push('§ '+year+' grandfather dies '+db[person.mother].father)
			}
		if (db[person.mother].mother && db[db[person.mother].mother] && db[db[person.mother].mother].d) {
			year = cleanYear(db[db[person.mother].mother].d)
			if (year >= birth && year < death) records.push('§ '+year+' grandmother dies '+db[person.mother].mother)
			}
		}


	// get child marriages
	if (person.fg) { 
		for (i=0;i<person.fg.length;i++) {
			for (j=2;j<person.fg[i].length;j++) {
				if (db[person.fg[i][j]]) {
					child = person.fg[i][j]
					if (db[child].male) childType = 'son'
					else childType = 'daughter'
					if (db[child].fg) {
						for (k=0;k<db[child].fg.length;k++) {
							 if (cleanYear(db[child].fg[k][0]) < death) records.push('§ '+db[child].fg[k][0]+' '+childType+' marries '+child+'\\+'+db[child].fg[k][1])
							}
						}
					}
				}
			}
		}

	
	// get death
	if (person.d) {
		records.push('§ '+person.d+' Death')
		records.push('death: '+individual)
		}


	

	var bottomOfPage = document.getElementById('places')
	
	// check for missing records
	var errors = []
	currentRecords = document.getElementById('in').textContent
	records.sort()
	for (i=0; i<records.length; i++) {
		if (! currentRecords.match(records[i])) errors.push(records[i].replace('\\',''))
		}

	// report
	if (errors.length > 0) {
		p = document.createElement('div')
		p.textContent = 'ADD THESE UPDATES:'
		p.className = 'updateTitle'
		bottomOfPage.appendChild(p)
		}

	if (errors.length > 0) {
		console.log('ADD THE FOLLOWING ENTRIES:')
		for (i=0;i<errors.length;i++) {
			console.log(errors[i])
			p = document.createElement('div')
			p.textContent = errors[i]
			bottomOfPage.appendChild(p)
			}
		}
	
	
	// post a notification if there are things to change
	if (errors.length > 0 ) {
		var update = document.createElement('div')
		update.id = 'updates'
		update.textContent = 'Updates available'
		document.getElementById('summary').firstChild.appendChild(update)
		}
	}


function cleanYear (year) {
	if (year.trim() === '' || year.trim() === '?') return ''
	year = year.replace(/by|bef|aft|abt|~|\*|,/g, '')
	return year.trim()
	}







function findRelatives (individual) {
	var person = db[individual]
	var out = ''
	var lines = []
	var i, j, k, parent
	
	// get spouse(s)
	if (db[individual].fg) { 
		for (i=0;i<db[individual].fg.length;i++) {
			if (db[db[individual].fg[i][1]] && db[db[individual].fg[i][1]].p) lines.push(db[individual].fg[i][1])
			}
		}
	
	// get parents
	if (person.father || person.mother) {
		if (person.father && db[person.father] && db[person.father].p) lines.push(person.father)
		if (person.mother && db[person.mother] && db[person.mother].p) lines.push(person.mother)
		}

	
	// get grandparents
	if (db[person.father]) { 
			if (a = db[person.father].father) if (db[a] && db[a].p) lines.push(a)
			if (a = db[person.father].mother) if (db[a] && db[a].p)  lines.push(a)
		if (db[person.mother]) {
			if (a = db[person.mother].father) if (db[a] && db[a].p) lines.push(a)
			if (a = db[person.mother].mother) if (db[a] && db[a].p) lines.push(a)
			}
		}
	
	// get siblings
	if (db[person.father]) parent = db[person.father]
	else if (db[person.mother]) parent = db[person.mother]
	if (parent && parent.fg) { 
		for (i=0;i<parent.fg.length;i++) {
			for (j=2;j<parent.fg[i].length;j++) {
				if ((s = parent.fg[i][j]) !== individual && db[s] && db[s].p) {
					lines.push(s)
					}
				}
			}
		}
	
	// get children
	if (db[individual].fg) { 
		for (i=0;i<db[individual].fg.length;i++) {
			for (j=2;j<db[individual].fg[i].length;j++) if (c = db[individual].fg[i][j]) if (db[c] && db[c].p) lines.push(c)
			}
		}
	
	// get children's spouses
	if (person.fg) { 
		for (i=0;i<person.fg.length;i++) {
			for (j=2;j<person.fg[i].length;j++) {
				if (db[person.fg[i][j]]) {
					child = person.fg[i][j]
					if (db[child].male) childType = 'son'
					else childType = 'daughter'
					if (db[child].fg) {
						for (var k=0;k<db[child].fg.length;k++) {
							var cspouse = db[child].fg[k][1]
							if (cspouse && db[cspouse] && db[cspouse].p) lines.push(cspouse)
							}
						}
					}
				}
			}
		}
	 return lines
	}


function getRelatives (relative) {
		var queryURL = window.project+'/'+relative+'.json'
		console.log(relative)
	
		fetch(queryURL, {mode:'no-cors'})
            .then(function (response) {
                return response.json()
            	})
            .then(function (person) {
                window.data[relative] = person;
				counter--
            	})
            .catch(function (error) {
                document.querySelector('#summary div').innerHTML += '<p style="font-size:.8em;">Error during fetch: '+error.message+' for '+relative+'</p>'
            	})
	}

function getPersonData (relative) {
		var queryURL = window.project+'/'+relative+'.txt'
	
		fetch(queryURL, {mode:'same-origin'})
            .then(function (response) {
                return response.text()
            	})
            .then(function (person) {
                document.getElementById('in').textContent = person;
				counter--
            	})
            .catch(function (error) {
                document.getElementById('summary').innerHTML += '<p>Error during fetch: '+error.message+' for '+relative+'</p>'
            	})
	}


function init () {
	// make a list of related people who have json data
	var relatives = findRelatives(thisPerson)
	relatives.push(thisPerson)
	console.log('This person is ',thisPerson)
	
	// read in the json data for relatives
	counter = relatives.length+1
	for (var r=0;r<relatives.length;r++) getRelatives(relatives[r])
	getPersonData(thisPerson)
	var timer = setInterval(function() {
		if (counter === 0) {
			clearInterval(timer)		
			setUpPage(thisPerson)
			}
		else if (debug) console.log('counter: ',counter)
		}, 20)
	}


function setUpPage (thisPerson) {
	document.getElementById('out').innerHTML = redisplay(document.getElementById('in').textContent,thisPerson,document.getElementById('summaryIn'))

	var dob = thisPerson.split('_')
	if (localStorage.ancestryHideRelatives === 'yes') toggleRelatives(document.getElementById('toggleRelatives'))
	if (localStorage.ancestryHideHistory === 'no') toggleHistory(document.getElementById('toggleEvents'), dob[dob.length-1])
	if (localStorage.ancestryExpandDetail === 'yes') toggleDetails(document.getElementById('toggleDetails'))
	//if (localStorage.ancestryMinimise === 'yes') toggleMinimal(document.getElementById('minimiseToggle'))
	
	checkBMD(thisPerson)
	}




var scriptFileLoaded = true

//console.log(localStorage)
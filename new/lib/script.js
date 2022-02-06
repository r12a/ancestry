var here = 'HERE!'
var enter = '\u23F5\u23F5\u23F5'
var exit = '\u23F4\u23F4\u23F4'

var data = {}
var events = {}
var debug = false
var trace = false
var counter

function replaceNames (note, event) {
	var out = note
	var namelist = note.match(/\{[^\}]+\}/g)
	if (namelist) {
		for (var i=0;i<namelist.length;i++) {
			namelist[i] = namelist[i].replace(/\{|\}/g,'')
			var name = namelist[i].split(':')
			out = out.replace('{'+namelist[i]+'}', getName('',name[0],name[1],true, event))
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
		if (records[i].className.match('recordDate')) {
			out += '\t</p><p style="margin:0;line-height:1.2;padding:0;font-weight:400;">'
			var ageYear = records[i].textContent.split('•')
			//var ageYearOut = '<span style="color:#C27B04;font-size:200%;">'+ageYear[0]+'</span> • '+ageYear[1]
			if (! ageYear[1]) continue
			var ageYearOut = '<span style="color:#C27B04;font-size:200%;">'+ageYear[0]+'</span> ('+ageYear[1].trim()+') '
			}
		if (records[i].className.match('keypoints') && records[i].textContent !== '') {
			var occ = records[i].querySelector('.occ')
			var place = records[i].querySelector('.place')
			if (occ) out += upperCaseFirst(occ.textContent)
			if (occ && place) out += ', '
			if (place) out += place.textContent
			}
		else if (records[i].className.match('recordTitle')) out += '<span style="color:#648200;">'+upperCaseFirst(records[i].textContent)+'</span> '
		else if (records[i].className.match('discn')) out += '<i style="font-size:80%;">'+upperCaseFirst(records[i].textContent)+'</i> '
		else if (records[i].className.match('recordDate')) out += ageYearOut+' '
		else out += '<i>'+records[i].textContent +'</i> '
		}
	if (document.getElementById('places')) out += document.getElementById('places').outerHTML
	out += '</p><button style="background-color:#706b63; color:white; font-size: 1.2em; border:0; border-radius: 1em; float: right;" onclick="this.parentNode.style.display=\'none\'">Close</button>'
	
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


function getDatePhraseOLD (date, year) {
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


function getDatePhrase (date, year, options) {
    if (trace) console.log('getDatePhrase(', date, year, options,')')
    // return a date with suitable preposition before, and taking into account ~,<,>, etc
    // options are for Date object
    
	if (!date) date = ''
    date = date.replace('*','')
    year = year.replace('*','')
    
	if (date.match(/by/)) return date+' '+year
	if (date.match(/onob|ca/)) {
		if (date.match(/\d/)) return date.replace(/onob|ca/,'on or before')+' '+year
		else return date.replace(/onob|ca/,'in or before')+' '+year
		}
	if (date.match(/abt|~/)) return date.replace(/abt|~/,'around ')+' '+year
	if (date.match(/bef|</)) return date.replace(/bef|</,'before')+' '+year
	if (date.match(/aft|>/)) return date.replace(/aft|>/,'after')+' '+year

	if (date && year) {
		if (date.match(/\d/)) {
            // bring the options into play only if there's a clear date
            if (options) {
                var ts = new Date(date+' '+year)
                return ' on '+new Intl.DateTimeFormat('en-GB', options).format(ts)
                }
            else return ' on '+date+' '+year
            }
		else return ' in '+date+' '+year
		}
	else if (year) {
		if (year.match(/abt|~/)) return 'around '+year.replace(/abt|~/,'')
		if (year.match(/bef|\</)) return 'before '+year.replace(/bef|\</,'')
		if (year.match(/bef|\>/)) return 'after '+year.replace(/bef|\>/,'')
		return ' in '+year
		}
	}


function getTimestamp (date, year) {
    if (trace) console.log('getTimestamp(', date, year,')')

    if (year.trim() === '?' || year.trim() === '') return ''
	
	if (date === '?' || date === '') date = '1 Jul'
    
    switch (date) {
        case 'Jan-Mar': date = '1 Feb'; break
        case 'Apr-Jun': date = '1 May'; break
        case 'Jul-Sep': date = '1 Aug'; break
        case 'Oct-Dec': date = '1 Nov'; break
        }

	if (! date.match(/[0-9]/)) date = '1 '+date
	
	date = date.replace(/by|bef|aft|abt|onob|~|\*|\<|\>|,/, '')
	year = year.replace(/by|bef|aft|abt|onob|~|\*|\<|\>|,/, '')
	
	date = date.replace(/\-.../, '')
    
    var dateObj = new Date(date.trim() +' '+ year.trim())

    if (trace) console.log(exit+'getTimestamp:', dateObj.getFullYear()+'-'+eval(dateObj.getMonth()+1).toString().padStart(2, '0')+'-'+dateObj.getDate().toString().padStart(2, '0'))
	return dateObj.getFullYear()+'-'+eval(dateObj.getMonth()+1).toString().padStart(2, '0')+'-'+dateObj.getDate().toString().padStart(2, '0')
	}



function getBirthTS (bDate, bYear) {
    if (trace) console.log('getBirthTS(', bDate, bYear,')')

    if (bYear.trim() === '?' || bYear.trim() === '') return ''
	
	if (bDate === '?' || bDate === '') bDate = '1 Jul'
    
    switch (bDate) {
        case 'Jan-Mar': bDate = '1 Feb'; break
        case 'Apr-Jun': bDate = '1 May'; break
        case 'Jul-Sep': bDate = '1 Aug'; break
        case 'Oct-Dec': bDate = '1 Nov'; break
        }

	if (! bDate.match(/[0-9]/)) bDate = '1 '+bDate
	
	bDate = bDate.replace(/by|bef|aft|abt|onob|~|\*|\<|\>|,/, '')
	bYear = bYear.replace(/by|bef|aft|abt|onob|~|\*|\<|\>|,/, '')
	
	bDate = bDate.replace(/\-.../, '')
    
    birthDate = new Date(bDate.trim() +' '+ bYear.trim())

    if (trace) console.log('getBirthTS returns:', birthDate.getFullYear()+'-'+eval(birthDate.getMonth()+1)+'-'+birthDate.getDate())
	return birthDate.getFullYear()+'-'+eval(birthDate.getMonth()+1)+'-'+birthDate.getDate()
	}



function getAge (phrase1, eDate, eYear, bDate, bYear, phrase2) {
    if (trace) console.log('getAge(',phrase1, eDate, eYear, bDate, bYear, phrase2,')')

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
	var bTime = new Date( bDate + ' 2000' )
	if (eTime < bTime) age--
	if (age < 0) age = 0
	
    if (trace) console.log('getAge returns:',phrase1+age+phrase2)
	return phrase1+age+phrase2
	}



function getAgeTS (phrase1, event, birth, phrase2) {
    // get someone's age by comparing timestamps, with optional text around
    if (trace) console.log('getAgeTS(',phrase1, event, birth, phrase2,')')

    if (typeof event === 'undefined' || typeof birth === 'undefined') {
        alert('Event or birth undefined in getAgeTS')
        return phrase1+'???'+phrase2
        }
    if (event.trim() === '' || birth.trim() === '?' || birth.trim() === '') return ''

    var eTime = new Date( event )
	var bTime = new Date( birth )
    
    // check whether the person is deceased, in which case we'll return 'dec'
    //if ()
    
    // get a rough estimate from the year comparison
    age = eTime.getFullYear() - bTime.getFullYear()
	if (age < 0) return phrase1+age+phrase2
    
    // refine it to see whether a birthday was passed
	var eDate = new Date( '2000-' + eval(eTime.getMonth()+1) + '-' + eTime.getDate() )
	var bDate = new Date( '2000-' + eval(bTime.getMonth()+1) + '-' + bTime.getDate() )
    if (eDate < bDate) age--
	if (age < 0) age = 0
	
    if (trace) console.log('getAgeTS returns:',phrase1+age+phrase2)
	return phrase1+age+phrase2
	}







function getName (phrase, id, part, uselink, addage) {
	// part identifies the format of the name: g, given; k, knownas; f,family, mX,married where X indicates which married name
	if (! db[id]) return id

	if (part.match('x')) { part=part.replace('x',''); uselink = false }  // shortcut for in page names
	var person = db[id]
	if (part === 'given') part = 'g'; if (part === 'both') part = 'gf'; // legacy code
	var startTag, endTag, givenname, g, k, f, m
	g = k = f = m = ''
	startTag = endTag = ''
    //if (part.match('a')) addage = true 
    //else addage = false
	if (uselink && person) { 
		if (person.p) startTag = '<a href="person.html?project='+project+'&person='+id+'"'
		else startTag = '<a href="tree.html?project='+project+'&person='+id+'" class="treeLink" '
		startTag += '>'; endTag = '</a>' 
		}
    
    // add age automatically
    if (addage) endTag += '<sup class="ageTag">'+getAgeTS('', addage, getBirthTS(db[id].bdate, db[id].b), '')+'</sup>'
    
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
    var allSurnames = ''
	if (part === 'gfm' || part === 'kfm') {
        if (person.f) allSurnames = person.f
        else allSurnames = '(?)'
		if (person.m) {
			for (var i=0;i<person.m.length;i++) allSurnames += '&#x23F5;&#x2009;'+person.m[i]
			//for (var i=0;i<person.m.length;i++) allSurnames += '&#x25B6;&#x23F5;&#x2009;'+person.m[i]
			}
        if (part === 'gfm') return startTag+g+' '+allSurnames+endTag
        if (part === 'kfm') return startTag+k+' '+allSurnames+endTag
		}
	if (part === 'gf+' || part === 'kf+') {
		if (person.m && person.m.length > 0) {
            allSurnames = person.m[0]
			}
        else allSurnames = ''
        if (part === 'gf+') return startTag+g+' '+allSurnames+endTag
        if (part === 'kf+') return startTag+k+' '+allSurnames+endTag
		}
	if (part === 'gf++') {
		if (person.m && person.m.length > 1) {
            allSurnames = person.m[1]
			}
        else allSurnames = ''
        if (part === 'gf++') return startTag+g+' '+allSurnames+endTag
        if (part === 'kf++') return startTag+k+' '+allSurnames+endTag
		}
	if (part === 'gf+++') {
		if (person.m && person.m.length > 2) {
            allSurnames = person.m[2]
			}
        else allSurnames = ''
        if (part === 'gf+++') return startTag+g+' '+allSurnames+endTag
        if (part === 'kf+++') return startTag+k+' '+allSurnames+endTag
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
	if (node.textContent === 'Show sources') {
		for (i=0;i<details.length;i++) details[i].open = 'open'
		node.textContent = 'Hide sources'
		localStorage.ancestryExpandDetail = 'yes'
		}
	else {
		for (i=0;i<details.length;i++) details[i].open = ''
		node.textContent = 'Show sources'
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



function formatSource (sources, discussion) {
    // wrap source lines in link markup
    if (trace) console.log(enter, 'formatSource(',sources,')')

    if (typeof sources === 'undefined') return ''
    
    var lines = sources.split('\n')
    for (var i=0;i<lines.length;i++) {
        if (lines[i].match('SOURCE') && lines[i].match('http')) {
            lines[i] = lines[i].replace('<br>','')
            parts = lines[i].split('http')
            parts[0] = parts[0].replace(/SOURCE: /,'')
            lines[i] = `<img src="lib/i/source.png" alt="Source link" title="Source link"><a target="_blank" href="http${ parts[1] }">${ parts[0] }</a>`
            }
        else if (lines[i].match('SOURCE')) {
            lines[i] = lines[i].replace('<br>','')
            lines[i] = '<img src="lib/i/source.png" alt="Source link" title="Source link">'+lines[i].replace(/SOURCE: /,'')
            }
        }
    
    sources = lines.join('\n').replace(/\[|\]/g,'')
    
    if (discussion) sources += '\n<img src="lib/i/discn.png" alt="Commentary" title="Commentary">'+discussion
    
    if (trace) console.log(exit,'formatSource:',sources)
    return sources
    }




function getSiblings (person) {
    // returns a string containing previously born siblings of person
    if (trace) console.log('getSiblings(',person,')')
    siblings = ''
    // get the id of the parent
    if (db[person].father && db[db[person].father]) parent = db[db[person].father]
    else if (db[person].mother && db[db[person].mother]) parent =db[db[person].mother]
    
    if (parent && parent.fg) {
        // go through the list of families for the parent
        for (i=0;i<parent.fg.length;i++) {
            // go through the children in each family
            for (j=2;j<parent.fg[i].length;j++) {
                if ((s = parent.fg[i][j]) !== person && db[s]) {
                    //if (n === siblingList.length-2) record += ' and '
				    //else if (n<siblingList.length-1) record += ', '
                    
                    //console.log("AGE GAP: ",getAge('',db[person].bdate,db[person].b,db[s].ddate,db[s].d,''))
                    
                   // check whether sibling already died
                    if (db[s].d && db[person].b && db[s].d < db[person].b) {
                        siblings += getName('', s, 'given', true) + ' (died), '
                        // console.log('Skipping sibling',  db[s].g)
                        continue
                        }
                    // skip anyone older
                    if (db[s].b && db[person].b && db[s].b > db[person].b) {
                        //console.log('Skipping sibling',  db[s].g)
                        continue
                        }
                    // otherwise, add sibling to the list
                    //siblings += s + ','
                    // get the age of the sibling
                    siblings += getName('', s, 'given', true) + ', ' + getAge('',db[person].bdate,db[person].b,db[s].bdate,db[s].b,'')+ ', '
                    //console.log(s, j, i)
                    }
                else { break }
                }
            }
        }
    if (trace) console.log('returns',siblings.substring(0,siblings.length-2))
    return siblings.substring(0,siblings.length-2)
    }

/*	
	var age = parseInt(eYear) - parseInt(bYear)
	if (age < 0) return phrase1+age+phrase2
	var eTime = new Date( eDate + ' 2000' )
	var bTime = new Date( bDate + ' 2000' )
	if (eTime < bTime) age--
	if (age < 0) age = 0


    for (n=0;n<siblingList.length;n++) {
								record += getName('', siblingList[n].trim(), 'given', true)
								if (n === siblingList.length-2) record += ' and '
								else if (n<siblingList.length-1) record += ', '
								}
*/

// ===================================================
// ================== MAIN FUNCTION ================
// ======================================================
// redisplay(document.getElementById('in').textContent,thisPerson,document.getElementById('summaryIn'))

function redisplay (everything, id, summary ) { 
    if (trace) console.log(enter, 'redisplay(everything='+everything+' id='+id+' summary='+summary+'['+summary.textContent+']'+')')
    personID = id // this is to test the buttons at the bottom
    
	var out = ''
	var thumb = ''
	var thumbLegend = ''
	var gps = []

	// get the general information
	var person = db[id]
    var birthDate = getBirthTS(db[thisPerson].bdate, db[thisPerson].b)

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


	// CREATE THE TOP BOILERPLATE +++++++++++++++++++++++++++++++++++++++++++++++++++++++
	
    // make the controls on the bottom line
	var dob = id.split('_')
	out += '<div id="topMenu">'
	out += '<a id="gotoTop" href="#top">Go to Top</a>'
	out += '<span id="summarise" onclick="summarise(this)">Summarise</span>'
	out += '<span id="toggleDetails" onclick="toggleDetails(this)">Show sources</span>'
	out += '<span id="toggleEvents" onclick="toggleHistory(this, '+dob[dob.length-1]+')">Show history</span>'
	out += '<span id="toggleRelatives" onclick="toggleRelatives(this)">Hide relatives</span>'
	//out += '<span id="minimiseToggle" onclick="addHistory(this, '+dob[dob.length-1]+')">Show history</span>'
    out += '</div>'


    // do the floating links
    out += '<div id="floatingLinks">'
	out += '<a id="gotoTree" title="Show Relationships" href="tree.html?project='+window.project+'&person='+id+'">&#x23F3;</a>'
    
	out += '<a title="Show Family Tree" href="ancestors.html?project='+project+'&person='+id+'">&#x1F333;</a> '
    
	out += '<a title="Show Descendants." style="opacity:80%;" href="descendants.html?project='+project+'&person='+id+'">&#x23EC;</a> '
    
	out += '<a title="Show Ancestors" style="opacity:80%;" href="precedents.html?project='+project+'&person='+id+'">&#x23EB;</a> '
    
	out += '<a title="Go to the Index." href="index.html?project='+project+'">&#x1F4C7;</a> '
    out += '</div>'


    out += '<div id="top"></div>'
	
	
	// popup window for summary
	out += '<div style="position:absolute; background-color:white; margin:auto;padding: 2em;border:1px solid #ccc;border-radius:1em;display:none; max-width: 70%;top: 18em;box-shadow: 10px 5px 5px gray;left: 15%;" id="summaryWin"></div>'


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
	out += '<div id="pageicon">📄</div><div id="banner"><div id="pagetitle">'+getName('', id, 'gfm', false)+'<br><span id="bannerdates">'+person.b+'\u2013'+person.d
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
				intro += pron+' married '+getName('', db[id].fg[i][1], 'gf', false)+' in '+db[id].fg[i][0].substr(0,4)
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
				else if (i>0) intro += ', ' 
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
		if (db[id].cstatus) intro += '<p style="color:#aaa; text-align:center;margin-top:1em;">&#x2014; '+db[id].cstatus+' &#x2014;</p>'
		summary.innerHTML = intro
		}
	out += summary.innerHTML+'</div></div><div class="keypoints">'
	
	// add the general links
	if (data[id] && data[id].links) {
		for (i=0;i<data[id].links.length;i++) {
			out += '<p><a href="'+data[id].links[i].url+'" target="_blank">'+data[id].links[i].title+'</a></p>'
			}
		}
	else out += '\u00A0'
	out += '</div></div>\n'




	
	// COMPILE A LIST OF EVENTS INVOLVING CLOSE FAMILY +++++++++++++++++++++++++++++++++++++++++++++++++++++++
    var eventList = []
    var selfnode = db[thisPerson]
    
    // get parents
    if (selfnode.father && (fathernode = db[selfnode.father])) {
        if (fathernode.death) eventList.push(fathernode.death.timestamp+'^'+selfnode.father+'^death')
        if (fathernode.marriages) {
            mkeys = Object.keys(fathernode.marriages)
            for (i=0;i<mkeys.length; i++) eventList.push(fathernode.marriages[mkeys[i]].timestamp+'^'+selfnode.father+'^marriage')
            }
        }
    if (selfnode.mother && (mothernode = db[selfnode.mother])) {
        if (mothernode.death) eventList.push(mothernode.death.timestamp+'^'+selfnode.mother+'^death')
        if (mothernode.marriages) {
            mkeys = Object.keys(mothernode.marriages)
            for (i=0;i<mkeys.length; i++) eventList.push(mothernode.marriages[mkeys[i]].timestamp+'^'+selfnode.mother+'^marriage')
            }
        }

    // get children
    var childList = []
    if (selfnode.fg) {
        for (i=0;i<selfnode.fg.length;i++) {
            for (c=2;c<selfnode.fg[i].length;c++) childList.push(selfnode.fg[i][c])
            }
        }
    
    //for (c=0;c<childList.length;c++) {
    //    if (db[childList[c]] && db[childList[c]].birth)
    //    }
    
    
        /*
        // stop if this is the start of research data  REPLACE THIS WITH LINK TO EXTERNAL FILE
        if (records[i].trim().toLowerCase().startsWith('research')) {
            researchNotes = records[i]
            researchNotes = researchNotes.replace(/(http(s)?:\/\/[^\s]+)/g, '<a href="$&" target="_blank">link</a>')
            //continue
            }
        */
        
    


	
	// ESTABLISH A LIST OF EVENTS & TIME PERIOD FOR SELECTING THEM  ++++++++++++++++++++++++++++++++++++++
        
    var isoDate
    var dateOptions = { weekday:'long', day:'numeric', month:'short' }
    var withWeekday = { weekday:'long', day:'numeric', month:'short', year:'numeric' }


    // start with the list generated by checkBMD
    events = records
    
    // add the local events to the event list
    if (db[thisPerson].events) {
        keys = Object.keys(db[thisPerson].events)
        for (i=0;i<keys.length;i++) {
            events.push(keys[i]+' event @ '+db[thisPerson].events[keys[i]].type)
            }
        }
    
    events.sort()
    
    console.log('EVENTS',events)
    
    
    
    // establish a window of time for inclusion of events
    var periodStart = getTimestamp(db[thisPerson].bdate, db[thisPerson].b)
    if (periodStart == '') { // ie. no birth date found
        for (i=0;i<events.length;i++) { // check the ordered events list for a sign of life
            if (events[i].match('event | marriage| son| daughter|self dies')) {
                var temp = events[i].split(' ')
                periodStart = temp[0]
                break
                }
            }
        }
    var periodEnd = getTimestamp(db[thisPerson].ddate, db[thisPerson].d)
    if (periodEnd == '') { // ie. no birth date found
        if (db[thisPerson].upto) periodEnd = db[thisPerson].upto
        else {
            for (i=events.length-1;i>-1;i--) { // check the reverse-ordered events list for a sign of life
                if (events[i].match('event | marriage| son| daughter| husband|self born')) {
                    var temp = events[i].split(' ')
                    periodEnd = temp[0]
                    break
                    }
                }
            }
        }

    
    
    console.log(here,here,'periodStart',periodStart)
    console.log(here,here,'periodEnd',periodEnd)


    var birth = getTimestamp(db[thisPerson].bdate, db[thisPerson].b)
    var death = getTimestamp(db[thisPerson].ddate, db[thisPerson].d)







 	// WORK THROUGH EACH EVENT +++++++++++++++++++++++++++++++++++++++++++++++++++++++
    for (var e=0;e < events.length; e++) {
        var record = ''
        //var info = events[e]
        var details = ''
        
        // info carries information about the person the event relates to
        var info = {}
        parts = events[e].split(' ')
        info.timestamp = parts[0]
        //info.ts = new Date(parts[0]+'T00:00:00')
        info.ts = new Date(parts[0].replace(/-/g, '\/'))
        info.person = parts[1]
        info.relation = parts[2]
        info.type = parts[3]
        
        //info.year = info.timestamp.substr(0,4)
        info.year = info.ts.getFullYear().toString()
        
        info.title = ''
        info.background = ''
        info.border = ''
        info.useGPS = true
        
        if (info.person !== 'event' && ! info.person.includes('^')) {
            info.bdate = db[info.person].bdate
            info.b = db[info.person].b
            info.ddate = db[info.person].ddate
            info.d = db[info.person].d
            }
        info.relative = ''
        
        console.log('INFO',info)
        
        
        // check whether we have the data, and whether the dates fall within the person's lifespan
        if (info.person !== 'event' && typeof db[info.person] === 'undefined' && ! info.person.includes('^')) { console.log(exit,'redisplay: Person undefined.'); continue }
        if (info.timestamp < periodStart || info.timestamp > periodEnd) { console.log(exit,'redisplay: Outside lifespan (periodStart,death=',periodStart,periodEnd,')'); continue }






        if (info.type === 'census') {
            info.useGPS = true
            info.title = 'Census'
            
            // add the census details to info
            for (x in db[thisPerson].events[info.timestamp]) info[x] = db[thisPerson].events[info.timestamp][x]
            for (x in censi[info.census]) info[x] = censi[info.census][x]

            console.log(here,here,'INFO after census merge',info)

            isoDate = new Date(info.timestamp)
            info.date = new Intl.DateTimeFormat('en-GB', dateOptions).format(isoDate)
            info.date = new Intl.DateTimeFormat('en-GB', dateOptions).format(info.ts)
    
            record += '<p>On '+info.date+' '+info.year+', '+given+getAge(' (aged ', info.date, info.year, db[thisPerson].bdate, born, ')')
            record += ' was at '+info.place+'. '
            if (info.head) {
                record += ' The household included '
                if (info.relation && info.relation === 'head') {
                    record += ' '+refpron
                    if (info.wife == null && info.children == null && info.visitors == null && info.others == null && info.serv == null) record += ' alone'
                    }
                else if (info.relation && info.relation === 'wife') record += ' her husband '+getName('',info.head.split(',')[0],'kf',true)
                else record += getName('',info.head.split(',')[0],'kfm',true)
                if (! info.wife && info.children === 0) record += ''
                else if (info.wife && info.children === 0) record += ' and '
                else if (info.wife) record += ','
                if (info.wife) {
                    if (info.relation && info.relation === 'wife') record += ' '+refpron
                    else record += ' his wife '+getName('',info.wife.split(',')[0],'k',true)
                    }
                if (info.wid && info.wid === id) record += ' ('+refpron+')'
                if (info.children) {
                    //if (info.children === 1) { record += ' and 1 child'; if (info.relation === 'child') record += ' ('+refpron+')' }
                    if (info.children.length === 1) { record += ' and 1 child'; if (info.relation === 'child') record += ' ('+given+')' }
                    else { record += ' and '+info.children.length+' children'; if (info.relation === 'child') record += ' (including '+given+')' }
                    }
                record += '. '
                if (info.others || info.visitors) {
                    record += ' There '
                    if (info.others) {
                        if (info.others.length === 1) { record += ' was also 1 other'; if (info.relation === 'other') record += ' ('+given+')' }
                        else if (info.others) { record += ' were '+info.others.length+' others'; if (info.relation === 'other') record += ' (including '+given+')' }
                        }
                    if (info.others && info.visitors) record += ' and there '
                    if (info.visitors) {
                        if (info.visitors.length === 1) { record += ' was also 1 visitor'; if (info.relation === 'visitor') record += ' ('+given+')' }
                        else if (info.visitors) { record += ' were also '+info.visitors.length+' visitors'; if (info.relation === 'visitor') record += ' (including '+given+')' }
                        }
                    record += '.'
                    }
                if (info.serv) {
                    record += ' There '
                    if (info.serv.length === 1) { record += ' was also 1 servant'; if (info.relation === 'serv') record += ' ('+given+')' }
                    else if (info.serv) { record += ' were '+info.servlength+' servants'; if (info.relation === 'serv') record += ' (including '+given+')' }
                    record += '.'
                    }
                record += '</p>'

                details = JSON.stringify(censi[info.census], ['place','head','wife','married','children','other','serv','visitors','cparish','details'], '\u200B').replace(/\{|\}/g,'').replace(/"/g,'')

                info.notes = info.notes.split('\n')
                for (n=0;n<info.notes.length;n++) if (info.notes[n] !== '') record += `<p>${ replaceNames(info.notes[n], info.timestamp) }</p>`
                }
           }



        if (info.type === 'born' && info.relation === 'self') {
            for (x in db[info.person].birth) info[x] = db[info.person].birth[x]
          
            siblingList = getSiblings(thisPerson)

            // set date to bdate (which means no need to define date here)
            if (db[thisPerson] && db[thisPerson].bdate) info.date = db[thisPerson].bdate
            else info.date = ''
            
            // check whether the birth date is based on the baptism date
            var goingByBap = false
            if (info.date && info.bapdate && info.date.match('~') && info.date.replace('~','') === info.bapdate) {
                goingByBap = true
                info.date = info.date.replace('~','onob ')
                }
            if (info.discussion) {
                record += '<img class="commentaryIcon" src="lib/i/discn.png" alt="Commentary" title="Commentary notes for this event." onclick="alert(`' + info.discussion + '`)">'
                }
            record += '<p>'+fullname+' was born '+getDatePhrase(info.date,info.year,withWeekday)
            if (goingByBap) {
                record += ' (the date of '+posspron.toLowerCase()+' baptism)'
                }
            if (info.place) record += ' at <span class="space">'+info.place+'</span>'
            record += getDBParents(', to ', thisPerson)
            record += '.'

            if (db[thisPerson].mother && db[db[thisPerson].mother]  && db[db[thisPerson].mother].f) {
                record += ' '+posspron+' mother\'s maiden name was '+db[db[thisPerson].mother].f+'.' 
                }
            if (info.informant) {
                informantText = replaceNames(info.informant)
                record += '<p>The informant on the birth certificate was '+informantText+'.</p>'
                }
            if (info.focc) {
                record += ' '+posspron+' father\'s occupation was '+info.focc+'.' 
                }
            record += '</p>'

            if (siblingList) {
                // get the number of siblings by checking the markup
                siblingLinks = siblingList.split('<a')
                if (siblingLinks.length === 1) record += '<p>'+pron+' had an elder sibling, '+getName('', siblingList[0].trim(), 'given', true)+'.</p>'
                else {
                    record += '<p>'+pron+' had '+eval(siblingLinks.length-1)+' elder siblings: '+siblingList
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
            if (info.notes && info.notes.length > 0) for (n=0;n<info.notes.length;n++) { record += '<p>'+replaceNames(info.notes[n])+'</p>' }
            if (info.fnotes && info.fnotes.length > 0) {
                record += '<div class="footnotes"><p>Notes</p><ol>'
                for (n=0;n<info.fnotes.length;n++) record += '<li>'+info.fnotes[n]+'</li>'
                record += '</ol></div>'
                }


            // settings for outside the main text
            info.title = 'Birth'
            
            info.useGPS = true
            
            details = formatSource(info.sources, info.discussion)
            
            if (typeof info.occ === 'undefined') info.occ = ''
           }




        else if (info.type === 'born') {
            // this is the birth of a relative
            for (x in db[info.person].birth) info[x] = db[info.person].birth[x]

            record += '<p>'
            record += upperCaseFirst(info.relation) +' '
            record += getName('', info.person, 'kg', true)
            record += ' was born '
            
            //record += getDatePhrase(info.bdate,info.b)
            record += getDatePhrase(info.bdate,info.b,withWeekday)
            
            //if (db[info.person] && db[info.person].bdate) record += getDatePhrase(db[info.person].bdate,year)
            //else if (data[info.person] && data[info.person].birth && data[info.person].birth.date) record += getDatePhrase(data[info.person].birth.date,year)
            //else record += getDatePhrase('',year)
            
            if (info.place) record += ' at '+info.place 
            if (birth) record += getAgeTS(', when '+given+' was ', info.timestamp, birth, ' years old')
            record += '.</p>'
            if (info.focc) {
                if (male) record += '<p>'+given+'\'s '
                else record += '<p>'+getName('', info.person, 'kx', true)+'\'s father\'s '
                record += ' occupation at the time was '+info.focc+'.</p>'
                }
            if (info.notes && info.notes.length > 0) for (n=0;n<info.notes.length;n++) { record += '<p>'+replaceNames(info.notes[n])+'</p>' }


            // prepare other settings
            //info.title = getName('', info.person, 'kg', true) + ' ' + info.type
           
            if (db[info.person] && db[info.person].birth) details = db[info.person].birth.sources

            if (info.relation.match('son|daughter|father|mother')) {}
            else info.background = 'other'

            if (info.relation.match('sister|brother')) {
                if (db[info.person].male) info.title = 'Brother '
                else info.title = 'Sister '
                }
            else info.title = ''
            info.title += getName('', info.person, 'kg', true) + ' ' + info.type

            
            info.useGPS = true
            
            details = formatSource(info.sources, info.discussion)
            
            if (info.focc && db[info.person].father === thisPerson) info.occ = info.focc
            }






        if (info.type === 'dies' && info.relation === 'self') {
            info = db[thisPerson].death
            info.useGPS = true
            info.title = 'Death'
            timestamp = new Date(info.timestamp)
            year = timestamp.getFullYear().toString()
           

            if (info.discussion) {
                record += '<img class="commentaryIcon" src="lib/i/discn.png" alt="Commentary" title="Commentary notes for this event." onclick="alert(`' + info.discussion + '`)">'
                }

            // overwrite info.date with thisPerson.ddate
            if (db[thisPerson].ddate) info.date = db[thisPerson].ddate
            else info.date = ''

            // check whether this is the burial date
            var goingByBur = false
            if (info.date && info.burdate && info.date.match('~') && info.date.replace('~','') === info.burdate) {
                goingByBur = true
                info.date = info.date.replace('~','onob ')
                }
            record += '<p>'+getName('', id, 'kfm', false)
            if (info.of) record += ' of '+info.of
            record += ' died '+getDatePhrase(info.date,year)
            if (info.place) record += ' at '+info.place
            if (goingByBur) {
                record += ' (the date of '+posspron.toLowerCase()+' burial)'
                }
            //if (info.place) record += ' at '+info.place
            if (male) pron = 'he'; else pron = 'she'
            record += getAge(' when '+pron+' was ', info.date, year, db[thisPerson].bdate, born, ' years old')
            record += '. '
            if (info.cause) record += ' The cause was '+info.cause+'. '
            if (info.occ) {
                if (male) record += ' His '; else record += ' Her '
                record += ' occupation at the time was '+info.occ.toLowerCase()+'. '
                }
            record += '</p>'
            //if (info.informant) record += '<p>The informant was '+info.informant+'.</p>'
            if (info.informant) {
                informantText = replaceNames(info.informant)
                record += '<p>The informant was '+informantText+'.</p>'
                }

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
            if (info.namedinprobate) {
                var pnames = info.namedinprobate.split(',')
                var probatenames = ''
                for (w=0;w<pnames.length;w++) {
                    if (w>0) probatenames += ', '
                    if (w===pnames.length-1) probatenames += 'and '
                    if (db[pnames[w].trim()]) probatenames += `${ getName('', pnames[w].trim(), 'kf', true) }` 
                    else  probatenames += `${ pnames[w].trim() }`
                    }
                record += `<p>Named in probate: ${ probatenames }.</p>`
                }
            if (info.obit) record += '<p>Obituary: <q>'+info.obit+'</q>.</p>'
            if (info.notes && info.notes.length > 0) for (n=0;n<info.notes.length;n++) { record += '<p>'+replaceNames(info.notes[n])+'</p>' }
            if (info.fnotes && info.fnotes.length > 0) {
                record += '<div class="footnotes"><p>Notes</p><ol>'
                for (n=0;n<info.fnotes.length;n++) record += '<li>'+info.fnotes[n]+'</li>'
                record += '</ol></div>'
                }
 
            details = formatSource(info.sources)
            info.border = 'death'

            // clarify occupation for right panel
            if (typeof info.occ === 'undefined') info.occ = ''
            if (typeof info.of !== 'undefined') info.place = info.of
            if (typeof info.place === 'undefined') info.place = ''
           }






        // relative dies
        else if (info.type === 'dies') {
            for (x in db[info.person].death) info[x] = db[info.person].death[x]

            record += '<p>'
            record += upperCaseFirst(info.relation) +' '
            switch (info.relation.toLowerCase()) {
                case 'grandfather':
                case 'grandmother': record += getName('', info.person, 'kfm', true); break
                default: record += getName('', info.person, 'k', true)
                }
            if (info.cause && info.cause.match(/killed/i)) record += ' was killed '
            else record += ' passed away '
            if (data[info.person] && data[info.person].death && data[info.person].death.date) record+= getDatePhrase(data[info.person].death.date,info.year)
            else if (db[info.person] && db[info.person].ddate) record+= getDatePhrase(db[info.person].ddate,info.year)
            else record+= getDatePhrase('',info.year)
            if (info.age) record += ', aged '+info.age+', '
            if (info.place) record += ' at '+info.place+', ';
            record += getAgeTS(' when '+given+' was ', info.timestamp, birth, ' years old.')
            if (info.relation === 'husband') {
                if (info.of && info.place) record += ' '+getName('', info.person, 'kx', true)+' lived at '+info.of+', and died at '+info.place+'.'
                else if (info.of) record += ' '+getName('', info.person, 'kx', true)+' lived at '+info.of+'.'
                else if (info.place) record += ' '+getName('', info.person, 'kx', true)+' died at '+info.place+'.'
                }
            else {
                if (info.of && info.place) record += ' '+getName('', info.person, 'kx', true)+' lived at '+info.of+', and died at '+info.place+'.'
                else if (info.of) record += ' '+getName('', info.person, 'kx', true)+' lived at '+info.of+'.'
                else if (info.place) record += ' '+getName('', info.person, 'kx', true)+' died at '+info.place+'.'
                }
            if (info.cause) record += ' '+getName('', info.person, 'given', true)+'\'s cause of death was '+info.cause+'. '
            record += '</p>'
            
            if (info.relation.match('father|mother') && info.burplace) record += `<p>${ getName('', info.person, 'kx', true) } was buried at ${ info.burplace }</p>`
            
            if (info.informant) {
                informantText = replaceNames(info.informant)
                record += '<p>The informant was '+informantText+'.</p>'
                }
            if (info.probate && info.relation === 'husband') record += `The probate record has: <q>${ info.probate }</q>.`
            if (info.notes && info.notes.length > 0) for (n=0;n<info.notes.length;n++) { record += '<p>'+replaceNames(info.notes[n])+'</p>' }


            // prepare information for elsewhere
            if (db[info.person] && db[info.person].death) details = formatSource(info.sources, info.discussion)

            info.title = ''
            //if (info.relation.match('son|daughter')) info.title += info.relation+' dies'
             if (info.relation.match('father|mother')) info.title += info.relation+' dies'
            else if (info.relation.match('brother|sister')) info.title += info.relation+' dies'
            else info.title = getName('', info.person, 'kg', true) + ' ' + info.type
            
            if (info.relation.match('son|daughter|father|mother')) { info.background = 'familydeath' }
            else info.background = 'other'
            
            if (info.relation.match('wife|husband')) info.border = 'death'
            
            info.place = ''
            }







        if (info.type === 'marriage' && info.relation === 'spouse') {
            // find the data
            if (db[thisPerson].marriages && db[thisPerson].marriages[info.person]) info = db[thisPerson].marriages[info.person]
            else if (db[info.person].marriages && db[info.person].marriages[thisPerson]) info = db[info.person].marriages[thisPerson]
            else { alert('Marriage data not found!'); return }
            
            year = info.timestamp.substr(0,4)
        
            if (info.discussion) {
                record += '<img class="commentaryIcon" src="lib/i/discn.png" alt="Commentary" title="Commentary notes for this event." onclick="alert(`' + info.discussion + '`)">'
                }
            if (info.marriagetype === 'unmarried') {
                record += '<p>'+given+' began a relationship with '
                if (male) record += getName('', info.bid, 'gkf', true)
                else record += getName('', info.gid, 'both', true)
                record += ' at '+info.place+', '
                if (info.date) record+= getDatePhrase(info.date,year)
                if (male) pron = 'he'; else pron = 'she'
                record += getAgeTS(' when '+pron+' was ', info.timestamp, birth, ' years old')
                record += '. '
                if (male) record += getName('', info.bid, 'gkf', true)+' was '+getAgeTS('', info.timestamp, db[info.bid].bdate+' '+db[info.bid].b, ' years old')
                else record += getName('', info.gid, 'gkf', true)+' was '+getAgeTS('', info.timestamp, db[info.gid].bdate+' '+db[info.bid].b, ' years old')
                }
            else {
                record += '<p>'+given+' married '
                if (male) record += getName('', info.bid, 'gkf', true)
                else record += getName('', info.gid, 'both', true)
                record += ' at '+info.place+', '
                if (info.date) record+= getDatePhrase(info.date,year)
                if (male) pron = 'he'; else pron = 'she'
                record += getAgeTS(' when '+pron+' was ', info.timestamp, birth, ' years old')
                record += '. '
                }

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

            if (info.witnesses) {
                var wits = info.witnesses.split(',')
                var witnesses = ''
                for (var w=0;w<wits.length;w++) {
                    if (w>0) witnesses += ', '
                    if (w===wits.length-1) witnesses += 'and '
                    if (db[wits[w].trim()]) witnesses += `${ getName('', wits[w].trim(), 'kf', true) }` 
                    else  witnesses += `${ wits[w].trim() }`
                    }
                }
            if (info.by && witnesses) record += '<p>They were married by '+info.by+' and the witnesses were '+witnesses+'.<p>'
            else { 
                if (info.by) record += '<p>They were married by '+info.by+'.<p>'
                if (witnesses) record += '<p>Witnesses were '+witnesses+'.<p>'
                }

            if (db[info.bid] && db[info.gid] && db[info.bid].d && db[info.gid].d) {
                var marrLength = Math.min(db[info.bid].d, db[info.gid].d) - parseInt(info.timestamp.substr(0,4))
                if (marrLength < 1) record += '<p>They were to be married for less than a year.</p>'
                else if (marrLength === 1) record += '<p>They were to be married for about a year.</p>'
                else {
                    if (info.marriagetype === 'unmarried') record += '<p>They were together for around '+marrLength+' years.</p>'
                    else record += '<p>They were to be married for around '+marrLength+' years.</p>'
                    }
                }
            if (info.notes && info.notes.length > 0) for (n=0;n<info.notes.length;n++) { record += '<p>'+replaceNames(info.notes[n])+'</p>' }
            if (info.fnotes && info.fnotes.length > 0) {
                record += '<div class="footnotes"><p>Notes</p><ol>'
                for (n=0;n<info.fnotes.length;n++) record += '<li>'+info.fnotes[n]+'</li>'
                record += '</ol></div>'
                }


            // stuff for display alongside the main text
            details = formatSource(info.sources, info.discussion)

            info.useGPS = true
            
            info.title = 'Marriage to '+getName('', info.person, 'kg', true)
            if (info.marriagetype === 'unmarried') {
                if (db[thisPerson].male) info.title = 'Marriage to '+info.bride
                else info.title = 'Relationship with '+info.groom
                }
            else {
                if (db[thisPerson].male) info.title = 'Marriage to '+info.bride
                else info.title = 'Marriage to '+info.groom
                }

            // get occupation for display in right panel
            if (db[thisPerson].male && info.gocc) info.occ = info.gocc
            else if (info.bocc) info.occ = info.bocc
            else info.occ = ''
            info.border = 'marriage'
            
            // set the place to their abode
            if (db[thisPerson].male && info.gparish) info.place = info.gparish
            else if (info.bparish) info.place = info.bparish
            }






        else if (info.type == 'marriage') {
            // marriage of a relative
            
            // find the info data
            var couple = info.person.split('^')
            if (db[couple[0]] && db[couple[0]].marriages && db[couple[0]].marriages[couple[1]]) var ptr = db[couple[0]].marriages[couple[1]]
            else if (db[couple[1]] && db[couple[1]].marriages && db[couple[1]].marriages[couple[0]]) var ptr = db[couple[1]].marriages[couple[0]]
            else alert('Couple data not found!')
            for (x in ptr) info[x] = ptr[x]
            
            record += '<p>'
            if (info.relation === 'daughter') { 
                record += given+'\'s daughter '+getName('', info.bid, 'kg', true)+' married '+getName('', info.gid, 'gkf', true)+getDatePhrase(info.date,info.timestamp.substr(0,4))
                if (info.place) record += ' at '+info.place
                record += '.</p>'
                }
            if (info.relation.toLowerCase() === 'son') {
                record += given+'\'s '+info.relation.toLowerCase()+' '+getName('', info.gid, 'given', true)+' married '+getName('', info.bid, 'both', true)+getDatePhrase(info.date,info.timestamp.substr(0,4))
                if (info.place) record += ' at '+info.place
                record += '.</p>'
                }
            if (info.relation.toLowerCase() === 'father') {
                record += given+'\'s '+info.relation.toLowerCase()+' '+getName('', info.gid, 'given', true)+' married '+getName('', info.bid, 'both', true)+getDatePhrase(info.date,info.timestamp.substr(0,4))
                if (info.place) record += ' at '+info.place
                record += '.</p>'
                }
            if (info.relation.toLowerCase() === 'mother') {
                record += given+'\'s '+info.relation.toLowerCase()+' '+getName('', info.bid, 'given', true)+' married '+getName('', info.gid, 'both', true)+getDatePhrase(info.date,info.timestamp.substr(0,4))
                if (info.place) record += ' at '+info.place
                record += '.</p>'
                }

            if (info.relation.toLowerCase() === 'daughter' && info.gfid) {
                record += '<p>The father of the groom was '+getName('', info.gfid, 'both', true)
                if (info.gfocc) record += ', '+info.gfocc
                record += '. '
                if (info.bfocc) record += ' The occupation of '+getName('', info.bfid, 'both', true)+' was '+info.bfocc+'. '
                record += '</p>'
                }
            if (info.relation.toLowerCase() === 'son' && info.bfid) {
                record += '<p>The father of the bride was '+getName('', info.bfid, 'both', true)
                if (info.bfocc) record += ', '+info.bfocc
                record += '. '
                if (info.gfocc) record += ' The occupation of '+getName('', info.gfid, 'both', true)+' was '+info.gfocc+'. '
                record += '</p>'
                }
            if (info.relation === 'son' && info.bfather) {
                record += '<p>The father of the bride was '+getName('', info.bfather, 'both', true)
                if (info.bfocc) record += ', '+info.bfocc
                record += '. '
                if (info.gfocc) record += ' The occupation of '+getName('', info.gfid, 'both', true)+' was '+info.gfocc+'. '
                record += '</p>'
                }
            if (info.notes && info.notes.length > 0) for (n=0;n<info.notes.length;n++) { record += '<p>'+replaceNames(info.notes[n])+'</p>' }
            info.background = 'other'


            // prepare information for elsewhere
            if (info.sources) details = formatSource(info.sources, info.discussion)
            
            if (info.relation === 'son') info.title = `<span style="font-size:90%; white-space: normal;">${ info.groom } marries ${ info.bride }</span>`
            else info.title = `<span style="font-size:90%; white-space: normal;">${ info.bride } marries ${ info.groom }</span>`
            

            if (info.relation === 'son' && info.gfocc) info.occ = info.gfocc
            if (info.relation === 'daughter' && info.bfocc) info.occ = info.bfocc
            info.place = ''

            }

//. ****** NOTE THAT THE DETAILS PANEL USED TO INCLUDE LOTS OF LINKS TO IMAGES, GPS, ETC AND DISCUSSION TEXT. NOW THAT'S ONLY DISPLAYED VIA ICONS IN THE RIGHT SIDE PANEL. ALSO, DISPLAY DATA KEY-VALUE PAIRS ARE NO LONGER SHOWN.

// info needed coming into this section: info.title, details, info.type/occ/place


        // clarify occupation for right panel
        if (typeof info.occ === 'undefined') info.occ = ''
        //if (typeof info.of !== 'undefined') info.place = info.of
        if (typeof info.place === 'undefined') info.place = ''
        if (typeof info.timestamp === 'undefined') alert('info.timestamp undefined for '+events[e])


        // draw age + year 
		out += '<div class="dateAndRecord">'
        out += '<div><div class="recordDate"'
		if (info.type === 'background' || info.type === 'figure') out += ' style="background-color:transparent;">'
		else out += '><span class="recordDateAge">'+getAgeTS('', info.timestamp, birth, '')+'</span><span class="recordDateAge" style="font-size:1px;line-height:1px;"> &bull; </span><span class="theYear">'+info.timestamp.substr(0,4)+'</span>'
        out += '</div>'
        out += '</div>'
         
        out += '<div class="record '+info.border+' '+info.background+'">'
      
		// add the record title and any floating icons
		out += '<div class="titleEtc">\n'
		if (info.type !== 'background') out += '<p class="recordTitleAge">'+getAgeTS('', info.timestamp, birth, '')+'</p>'
		out += '<p class="recordTitle">'+info.title+'</p>'
        out += '</div>\n'
        
        out += '<div class="descriptionText">' + record + '</div>'
        
        if (info.type !== 'background' && info.type !== 'figure') out += '<details><summary></summary><pre>'+details+'</pre></details>'
        out += '</div>\n' // close record
        
        //keypoints here
        out += '<div class="keypoints kp'+info.type+'">'
		out += '<div class="occ">'+info.occ+'</div>'
		out += '<div class="place">'+info.place+'</div>'
        out += '<div></div>'
        
        // create the floated icon links
        floatedIcons = ''
        if (info.images) {
            for (j=0;j<info.images.length;j++) {
                floatedIcons += addFIcon(info.images[j],'record')
                }
            }
        if (info.gps) {
            for (j=0;j<info.gps.length;j++) {
                floatedIcons += addFIcon(info.gps[j],'gps')
                }
            }
        out += `<p class="floatedIcons">${ floatedIcons }</p>`
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

    // create a link to the map
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
        param += temp
        }
    out += '<p><a href="map.html?locations='+param+'" target="_blank">View all on map</a></p>'

    out += `<div>
            <button onclick="showProbates(personID)">In probate</button>
            <button onclick="showWitnesses(personID)">As witness</button>
            <button onclick="showInformants(personID)">As informant</button>
            </div>
            `

    // show all events
    out += '<details id="networkList"><summary>FAMILY NETWORK DATA</summary>'
    for (e=0;e<events.length;e++) out += `<p>${ events[e] }</p>`
    out += '</details>'

    out += '</div>'
    
    
    
    
    out += '</div>' 

    if (trace) console.log(exit,'redisplay')
	return out
    }







function showProbates (person) {
    out = 'Named in probate\n'
    allNames = Object.keys(db)
    allNames.forEach(name => { 
        if (db[name].death) {
            var fields = db[name].death
            for (f=0;f<fields.length;f++) {
                parts = fields[f].split(':')
                if (parts[0] === 'namedInProbate' && parts[1].includes(person)) out += db[name].d + ' '+getName('',name,'kf',false)+' '+name+'\n'
                }
            }
        })
    alert(out)
    }


function showProbates (person) {
    out = 'Named in probate\n'
    allNames = Object.keys(db)
    allNames.forEach(name => { 
        if (db[name].death) {
            if (db[name].death.namedinprobate && db[name].death.namedinprobate.includes(person)) out += db[name].death.timestamp.substr(0,4) + ' '+getName('',name,'kf',false)+' '+name+'\n'
            }
        })
    alert(out)
    }



function showInformants (person) {
    out = 'Named as an informant:\n'
    allNames = Object.keys(db)
    allNames.forEach(name => { 
        if (db[name].birth) {
            if (db[name].birth.informant && db[name].birth.informant.includes(person)) out += db[name].birth.timestamp.substr(0,4) + ' '+getName('',name,'kf',false)+' '+name+'\n'
            }
        })
    allNames.forEach(name => { 
        if (db[name].death) {
            if (db[name].death.informant && db[name].death.informant.includes(person)) out += db[name].death.timestamp.substr(0,4) + ' '+getName('',name,'kf',false)+' '+name+'\n'
            }
        })
    alert(out)
    }


function showWitnesses (person) {
    out = 'Named as a witness in the following events:\n'
    allNames = Object.keys(db)
    allNames.forEach(name => { 
        if (db[name].marriages) {
            var spouses = Object.keys(db[name].marriages)
            for (var i=0;i<spouses.length;i++) {
                if (db[name].marriages[spouses[i]].witnesses && db[name].marriages[spouses[i]].witnesses.includes(person)) out += db[name].marriages[spouses[i]].timestamp.substr(0,4) + ' '+getName('',name,'kf',false)+' '+name+'\n'
                }
            }
        })
    alert(out)
    }





function cleanYear (year) {
	if (year.trim() === '' || year.trim() === '?') return ''
	year = year.replace(/by|bef|aft|abt|~|\*|,/g, '')
	return year.trim()
	}





function checkBMD (individual) {
    if (trace) console.log('checkBMD('+individual+')')
    
	var person = db[individual]
	var out = ''
	var i, j, k, parent
	
	
	// initialise list of records
	records = []
	var sibling, siblingType, year, spouse, marriageList, child, childType, byear, dyear
	
	
	// get birth & death
	if (person.b) { records.push(getTimestamp(person.bdate, person.b)+' '+thisPerson+' self born'); birth = getTimestamp(person.bdate, person.b) }
    //if (person.upto) { records.push(getTimestamp('31 Dec', person.upto.toString())+' '+thisPerson+' self upto'); death = getTimestamp('31 Dec', person.upto.toString()) }
	if (person.d) { records.push(getTimestamp(person.ddate, person.d)+' '+thisPerson+' self dies'); death = getTimestamp(person.ddate, person.d) }
	
		
	// get siblings
	if (db[person.father]) parent = db[person.father]
	else if (db[person.mother]) parent = db[person.mother]
	if (parent && parent.fg) { 
		for (var i=0;i<parent.fg.length;i++) {
			for (var j=2;j<parent.fg[i].length;j++) {
				if (db[parent.fg[i][j]]) {
					sibling = parent.fg[i][j]
					if (db[sibling].male) type = 'brother'
					else type = 'sister'
                    if (db[parent.fg[i][j]].b !== '' && parent.fg[i][j] !== thisPerson) records.push(getTimestamp(db[parent.fg[i][j]].bdate, db[parent.fg[i][j]].b)+' '+parent.fg[i][j]+' '+type+' born')
                    if (db[parent.fg[i][j]].d !== '' && parent.fg[i][j] !== thisPerson) records.push(getTimestamp(db[parent.fg[i][j]].ddate, db[parent.fg[i][j]].d)+' '+parent.fg[i][j]+' '+type+' dies')
					}
				}
			}
		}

	// get marriage
	if (person.fg) {
		for (i=0;i<person.fg.length;i++) {
            records.push(person.fg[i][0]+' '+person.fg[i][1]+' spouse marriage')
			}
		}

	// get spouse death
	if (person.fg) {
		for (i=0;i<person.fg.length;i++) {
			var spouse = person.fg[i][1]
			if (db[spouse] && db[spouse].d) {
				if (db[spouse].male) type = 'husband'
				else type = 'wife'
				records.push(getTimestamp(db[spouse].ddate, db[spouse].d)+' '+spouse+' '+type+' dies')
				}
			}
		}

	// get children
	if (person.fg) { 
		for (i=0;i<person.fg.length;i++) {
			for (j=2;j<person.fg[i].length;j++) {
				if (db[person.fg[i][j]]) {
					child = person.fg[i][j]
					if (db[child].male) type = 'son'
					else type = 'daughter'
					if (db[child].b) records.push(getTimestamp(db[child].bdate, db[child].b)+' '+child+' '+type+' born')
					if (db[child].d) records.push(getTimestamp(db[child].ddate, db[child].d)+' '+child+' '+type+' dies')
					}
				}
			}
		}

	// get parents death
	if (db[person.father]) { 
        if (db[person.father].d) {
			records.push(getTimestamp(db[person.father].ddate, db[person.father].d)+' '+person.father+' father dies')
			}
		}
	if (db[person.mother]) { 
		if (db[person.mother].d) {
			records.push(getTimestamp(db[person.mother].ddate, db[person.mother].d)+' '+person.mother+' mother dies')
			}
		}


	// get grandparents death
	var gparent
	if (db[person.father]) { 
		if (db[person.father].father && db[db[person.father].father] && db[db[person.father].father].d) {
            records.push(getTimestamp(db[db[person.father].father].ddate, db[db[person.father].father].d)+' '+db[person.father].father+' grandfather dies')
			}
		if (db[person.father].mother && db[db[person.father].mother] && db[db[person.father].mother].d) {
            records.push(getTimestamp(db[db[person.father].mother].ddate, db[db[person.father].mother].d)+' '+db[person.father].mother+' grandmother dies')
			}
		}
	if (db[person.mother]) { 
		if (db[person.mother].father && db[db[person.mother].father] && db[db[person.mother].father].d) {
            records.push(getTimestamp(db[db[person.mother].father].ddate, db[db[person.mother].father].d)+' '+db[person.mother].father+' grandfather dies')
			}
		if (db[person.mother].mother && db[db[person.mother].mother] && db[db[person.mother].mother].d) {
            records.push(getTimestamp(db[db[person.mother].mother].ddate, db[db[person.mother].mother].d)+' '+db[person.mother].mother+' grandmother dies')
			}
		}


	// get child marriages
	if (person.fg) { 
		for (i=0;i<person.fg.length;i++) {
			for (j=2;j<person.fg[i].length;j++) {
				if (db[person.fg[i][j]]) {
					child = person.fg[i][j]
					if (db[child].male) type = 'son'
					else type = 'daughter'
					if (db[child].fg) {
						for (k=0;k<db[child].fg.length;k++) {
							 records.push(db[child].fg[k][0]+' '+child+'^'+db[child].fg[k][1]+' '+type+' marriage')
							}
						}
					}
				}
			}
		}

	

	
/*
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
    */
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
	if (trace) console.log('getRelatives(', relative,')')

    window.data[relative] = db[relative]
    counter --
	}

function getPersonDataOLD (relative) {
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




function getPersonData (relative) {
	if (trace) console.log('getPersonData(', relative,',')

    document.getElementById('in').textContent = relative.timeline;
    counter--
	}


function init () {
	// make a list of related people who have json data
	if (trace) console.log(enter,'init()')
	var relatives = findRelatives(thisPerson)
	relatives.push(thisPerson)
	if (debug) console.log('Init: thisPerson is ',thisPerson)
	if (debug) console.log('Init: relatives is ',relatives)
	
	// read in the json data for relatives
	for (var r=0;r<relatives.length;r++) getRelatives(relatives[r])
    
    // add the timeline sequence to a hidden div
    document.getElementById('in').textContent = db[thisPerson].timeline
    
    setUpPage(thisPerson)
    if (trace) console.log(exit, 'init')
    }



function setUpPage (thisPerson) {
    if (trace) console.log(enter,'setUpPage('+thisPerson+')')
    
	checkBMD(thisPerson)
	document.getElementById('out').innerHTML = redisplay(document.getElementById('in').textContent,thisPerson,document.getElementById('summaryIn'))

	var dob = thisPerson.split('_')
	if (localStorage.ancestryHideRelatives === 'yes') toggleRelatives(document.getElementById('toggleRelatives'))
	if (localStorage.ancestryHideHistory === 'no') toggleHistory(document.getElementById('toggleEvents'), dob[dob.length-1])
	if (localStorage.ancestryExpandDetail === 'yes') toggleDetails(document.getElementById('toggleDetails'))
	//if (localStorage.ancestryMinimise === 'yes') toggleMinimal(document.getElementById('minimiseToggle'))
	
    if (trace) console.log(exit, 'setUpPage')
	}




var scriptFileLoaded = true

//console.log(localStorage)
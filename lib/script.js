var here = 'HERE!'
var enter = '\u23F5\u23F5\u23F5'
var exit = '\u23F4\u23F4\u23F4'

var data = {}
var events = {}
var debug = true
var trace = false
var traceutils = false
var counter
var thisPage = {} // contains useful data relating to the person this page is associated with
// in the main function, event collects information about relatives of this person, or events

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

function summariseOLD (node) {
	document.getElementById('summaryWin').style.display = 'block'
	var out = '</p><button style="background-color:#706b63; color:white; font-size: 1.2em; border:0; border-radius: 1em; float: right;" onclick="this.parentNode.style.display=\'none\'">X</button>'
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


function copyThis (personID) {
    navigator.clipboard.writeText(personID)
    document.getElementById('copyNotice').style.display = 'block'
    setTimeout(() => { document.getElementById('copyNotice').style.display = 'none' }, '500')
    }


function summarise (node, thisPerson) {
	var out = ''
    var occ, places, placeSet, occSet
    
    if (document.getElementById('summaryWin').style.display === 'block') document.getElementById('summaryWin').style.display = 'none'
	else document.getElementById('summaryWin').style.display = 'block'
    
    //out += '<button class="summaryClose" onclick="this.parentNode.style.display=\'none\'">X</button>'
    
    placeSet = new Set([])
    occSet = new Set([])

    // find all occupation and place data
   	var records = document.querySelectorAll('.dateAndRecord')
	for (var i=0;i<records.length;i++) {
        if (records[i].querySelector('.selfRelation') && records[i].querySelector('.keypoints')) {
			occ = records[i].querySelector('.occ')
			if (occ) occSet.add(upperCaseFirst(occ.textContent))
            
			places = records[i].querySelectorAll('.place')
			for (p=0;p<places.length;p++) placeSet.add(places[p].textContent.replace(/res: /,''))
			}
        else { // records of children & spouses
			occ = records[i].querySelector('.occ')
			if (occ) occSet.add(upperCaseFirst(occ.textContent)) // assumes this is focc

            places = records[i].querySelectorAll('.place')
            for (p=0;p<places.length;p++) {
                console.log(places[p], places[p].dataset.athome)
                if (places[p].dataset.athome && places[p].dataset.athome.includes(thisPerson)) placeSet.add(places[p].textContent.replace(/res: /,''))
                }
            }
		} 


/* 
   	var records = document.querySelectorAll('.keypoints')
	for (var i=0;i<records.length;i++) {
		if (records[i].className.match('keypoints') && records[i].textContent !== '') {
			var occ = records[i].querySelector(' .occ')
			var place = records[i].querySelector('.place')
			if (occ) occSet.add(upperCaseFirst(occ.textContent))
			if (place) placeSet.add(place.textContent)
			}
		}
*/




    out += '<h4>BMD</h4><ul>'
    if (db[thisPerson].b) {
        out += `<li style="font-size: 1.4em;">${ db[thisPerson].b }`
        if (db[thisPerson].bplace) out += ` ${ db[thisPerson].bplace }`
        }
    out += ' \u2014 '
    if (db[thisPerson].d) {
        out += `${ db[thisPerson].d }`
        if (db[thisPerson].dplace) out += ` ${ db[thisPerson].dplace }`
        out += `</li>`
        }

    if (db[thisPerson].fg) {
        for (i=0;i<db[thisPerson].fg.length;i++) {
            out += `<li>${ db[thisPerson].fg[i][0] } ${ getName('', db[thisPerson].fg[i][1], 'kf', true, false) }</li>`
            out += `<ol>`
            for (j=2;j<db[thisPerson].fg[i].length;j++) out += `<li>${ getName('', db[thisPerson].fg[i][j], 'k', true, false) }</li>`
            out += `</ol>`
            }
        }

    out += '</ul>'



    out += '<h4>Places</h4><ul>'
    var placeArray = [...placeSet]
    for (var i=0;i<placeArray.length;i++) if (placeArray[i] !== '') out += `<li><a href="search.html?project=${ project }&place=${ placeArray[i].trim() }" target="_blank">${ placeArray[i].trim() }</a>`
    out += '</ul>'
	//if (document.getElementById('places')) out += document.getElementById('places').outerHTML
    
 
    out += '<h4>Occupations</h4><ul>'
    var occArray = [...occSet]
    for (var i=0;i<occArray.length;i++) if (occArray[i] !== '' && occArray[i] !== 'Child') out += `<li><a href="search.html?project=${ project }&occupation=${ occArray[i].trim() }" target="_blank">${ occArray[i].trim() }</a>`
    out += '</ul>'
    
    var witness = showWitnesses(thisPerson)
    if (witness !== '<h4>Named as witness:</h4><ul></ul>') out += witness
	
    var mentioned = showAppearsIn(thisPerson)
    if (mentioned !== '<h4>Mentioned in:</h4><ul></ul>') out += mentioned
	
    var informant = showInformants(thisPerson)
    if (informant !== '<h4>Named as an informant:</h4><ul></ul>') out += informant
	
    var probate = showProbates(thisPerson)
    if (probate !== '<h4>Named in probate:</h4><ul></ul>') out += probate
    
    var census = showCensusEntries(thisPerson)
    if (census !== '<h4>Census entries:</h4><ul></ul>') out += census
    
	out += '<div class="summaryClose" onclick="this.parentNode.style.display=\'none\'">X</div>'
	
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
    //console.log('addFIcon', text, type)
	var parts, out
	if (text) {
		if (type === 'gps') {
            text = text.replace(/\u00A7/g,'')
			parts = text.split('http')
			out = `<p class="floatedIconText"><a target="_blank" class="gpslink" href="http${ parts[1] }"><img src="lib/i/map.png" alt="" title="${ parts[0] }"> ${ parts[0] }</a></p>`
            //console.log("GOING OUT",out)
			return out.trim()
			}
		if (type === 'record') {
			if (text.match(/url:/)) {
                parts = text.split('url:')
                out = `<p class="floatedIconText"><a target="_blank" href="${ window.project }/${ parts[1] }"><img src="lib/i/record.png" alt="${ parts[0] }" title="${ parts[0] }"> ${ parts[0] }</a></p>`
                return out
                }
            else {
                parts = text.split('https:')
                out = `<p class="floatedIconText"><a target="_blank" href="https:${ parts[1] }"><img src="lib/i/record.png" alt="${ parts[0] }" title="${ parts[0] }"> ${ parts[0] }</a></p>`
                return out
                }
			}
		/*if (type === 'record') {
			parts = text.split('url:')
			//out = '<a target="_blank" href="'+window.project+'/'+parts[1]+'"><img src="lib/i/record.png" alt="'+parts[0]+'" title="'+parts[0]+'"/></a>'
			out = `<p class="floatedIconText"><a target="_blank" href="${ window.project }/${ parts[1] }"><img src="lib/i/record.png" alt="${ parts[0] }" title="${ parts[0] }"> ${ parts[0] }</a></p>`
			return out
			}*/
		if (type === 'link') {
			if (text.match(/url:/)) {
				parts = text.split('url:')
				out = '<p class="floatedIconText"><a target="_blank" href="'+window.project+'/'+parts[1]+'"><img src="lib/i/info.png" alt="'+parts[0]+'" title="'+parts[0]+'"> '+parts[0]+'</a></p>'
				}
			else if (text.match(/https:/)) { 
				parts = text.split('https:')
				out = '<p class="floatedIconText"><a target="_blank" href="https:'+parts[1]+'"><img src="lib/i/info.png" alt="'+parts[0]+'" title="'+parts[0]+'"> '+parts[0]+'</a></p>'
				}
			else { 
				parts = text.split('http:')
				out = '<p class="floatedIconText"><a target="_blank" href="http:'+parts[1]+'"><img src="lib/i/info.png" alt="'+parts[0]+'" title="'+parts[0]+'"> '+parts[0]+'</a></p>'
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


function getDatePhraseOLD (date, year, options) {
    if (trace) console.log('getDatePhrase(', date, year, options,')')
    console.log('getDatePhrase(', date, year, options,')')
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


function getDatePhrase (date, year, options) {
    if (trace) console.log('getDatePhrase(', date, year, options,')')
    if (trace) console.log('getDatePhrase(', date, year, options,')')
    // return a date with suitable preposition before, and taking into account ~,<,>, etc
    // options are for Date object
    var prefix = ''
    
	if (!date) date = ''
    date = date.replace('*','')
    year = year.replace('*','')
    
    // get prefix & store for later
    if (year.match(/abt|~/)) {
        prefix = 'around '
        year = year.replace(/abt|~/,'')
        }
    else if (year.match(/bef|\</)) {
        prefix = 'before '
        year = year.replace(/bef|\</,'')
        }
    else if (year.match(/aft|\>/)) {
        prefix = 'after '
        year = year.replace(/aft|\>/,'')
        }
    else prefix = ' in '
    
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
		return prefix+year
		}
	}


function getTimestamp (date, year) {
    if (traceutils) console.log('getTimestamp(', date, year,')')

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

    if (traceutils) console.log(exit+'getTimestamp:', dateObj.getFullYear()+'-'+eval(dateObj.getMonth()+1).toString().padStart(2, '0')+'-'+dateObj.getDate().toString().padStart(2, '0'))
	return dateObj.getFullYear()+'-'+eval(dateObj.getMonth()+1).toString().padStart(2, '0')+'-'+dateObj.getDate().toString().padStart(2, '0')
	}



function getBirthTS (bDate, bYear) {  //    DON'T USE THIS - USE GETTIMESTAMP INSTEAD
    if (traceutils) console.log(enter, 'getBirthTS(', bDate, bYear,')')

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

    if (traceutils) console.log(exit, 'getBirthTS returns:', birthDate.getFullYear()+'-'+eval(birthDate.getMonth()+1)+'-'+birthDate.getDate())
	return birthDate.getFullYear()+'-'+eval(birthDate.getMonth()+1)+'-'+birthDate.getDate()
	}



function getAge (phrase1, eDate, eYear, bDate, bYear, phrase2) {
    if (traceutils) console.log(enter, 'getAge(',phrase1, eDate, eYear, bDate, bYear, phrase2,')')

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
	
    if (traceutils) console.log(exit, 'getAge returns:',phrase1+age+phrase2)
	return phrase1+age+phrase2
	}



function getAgeTS (phrase1, event, birth, phrase2) {
    // get someone's age by comparing timestamps, with optional text around
    if (traceutils) console.log(enter, 'getAgeTS(',phrase1, event, birth, phrase2,')')

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
	
    if (traceutils) console.log(exit, 'getAgeTS returns:',phrase1+age+phrase2)
	return phrase1+age+phrase2
	}







function getName (phrase, id, part, uselink, addage) {
    if (traceutils) console.log('getName(',phrase, id, part, uselink, addage)
	// part identifies the format of the name: g, given; k, knownas; f,family, mX,married where X indicates which married name
    // a 0 in the part variable suppresses the addition of the person's age � this tends to be used when you want something like "Mary's sister"
    // addage is a time stamp for the event
	if (! db[id]) return id

    // check for age cancellation flag
    if (part && part.match('0')) {
        addage = false
        part = part.replace(/0/,'')
        }
    
	if (part && part.match('x')) { part=part.replace('x',''); uselink = false }  // shortcut for in page names
	var person = db[id]
	if (part === 'given') part = 'g'; if (part === 'both') part = 'gf'; // legacy code
	var startTag, endTag, givenname, g, k, f, m
	g = k = f = m = ''
	startTag = endTag = ''
    //if (part.match('a')) addage = true 
    //else addage = false
	if (uselink && person) { 
		if (person.p) startTag = '<a href="person.html?person='+id+'&project='+project+'"'
		else startTag = '<a href="tree.html?person='+id+'&project='+project+'" class="treeLink" '
		startTag += '>'; endTag = '</a>' 
		}
    // add age automatically
    if (addage) endTag += '<sup class="ageTag">'+getAgeTS('', addage, getTimestamp(db[id].bdate, db[id].b), '')+'</sup>'
    
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
	var details = document.querySelectorAll('.otherRelative')
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


function terse () {
    // function to be called from the inspector to show only records relating to self
    rels = document.querySelectorAll('.closeRelation')
    for (i=0;i<rels.length;i++) rels[i].parentNode.style.display = 'none'
    
    for (i=0;i<rels.length;i++) {
        if (rels[i].parentNode.querySelector('.kpcensus')) rels[i].parentNode.style.display = 'flex'
        }
    
    for (i=0;i<rels.length;i++) {
        if (rels[i].querySelector('.recordTitle') && rels[i].querySelector('.recordTitle').textContent === 'Birth') rels[i].parentNode.style.display = 'flex'
        }
    
    for (i=0;i<rels.length;i++) {
        if (rels[i].querySelector('.recordTitle') && rels[i].querySelector('.recordTitle').textContent === 'Death') rels[i].parentNode.style.display = 'flex'
        }
    
    for (i=0;i<rels.length;i++) {
        if (rels[i].querySelector('.recordTitle') && rels[i].querySelector('.recordTitle').textContent.includes('Marriage')) rels[i].parentNode.style.display = 'flex'
        }
    }



function toggleRelativesX (node) {
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
    if (traceutils) console.log(enter, 'formatSource(',sources,')')

    if (typeof sources === 'undefined') return ''
    
    var lines = sources.split('\n')
    for (var i=0;i<lines.length;i++) {
        if (lines[i].match('SOURCE') && lines[i].match('http')) {
            lines[i] = lines[i].replace('<br>','')
            parts = lines[i].split('http')
            parts[0] = parts[0].replace(/SOURCE: /,'')
            lines[i] = `<img src="lib/i/source.png" alt="Source link" title="Source link"><a target="_blank" href="http${ parts[1] }">${ parts[0] }</a>`
            }
        else if (lines[i].match('SOURCE') && lines[i].match('url:')) {
            parts = lines[i].split('url:')
            parts[0] = parts[0].replace(/SOURCE: /,'')
            lines[i] = `<img src="lib/i/source.png" alt="Source link" title="Source link"><a target="_blank" href="${ window.project }/${ parts[1] }">${ parts[0] }</a>`
            }
        else if (lines[i].match('SOURCE')) {
            lines[i] = lines[i].replace('<br>','')
            lines[i] = '<img src="lib/i/source.png" alt="Source link" title="Source link">'+lines[i].replace(/SOURCE: /,'')
            }
        }
    
    sources = lines.join('\n').replace(/\[|\]/g,'')
    
    if (discussion) sources += '\n<img src="lib/i/discn.png" alt="Commentary" title="Commentary">'+discussion
    
    if (traceutils) console.log(exit,'formatSource:',sources)
    return sources
    }

/*
			if (text.match(/url:/)) {
				parts = text.split('url:')
				out = '<a target="_blank" href="'+window.project+'/'+parts[1]+'"><img src="lib/i/info.png" alt="'+parts[0]+'" title="'+parts[0]+'"/></a>'
				}
*/

function getSiblings (person, event) {
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
                        siblings += getName('', s, 'given', true) + '<sup class="ageTag">(dec)</sup>, '
                        //siblings += getName('', s, 'given', true) + ' (dec), '
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
                    siblings += getName('', s, 'given', true, event)+ ', '
                    // siblings += getName('', s, 'given', true) + ', ' + getAge('',db[person].bdate,db[person].b,db[s].bdate,db[s].b,'')+ ', '
                    //console.log(s, j, i)
                    }
                else { break }
                }
            }
        }
    if (trace) console.log('returns',siblings.substring(0,siblings.length-2))
    return siblings.substring(0,siblings.length-2)
    }



function getAllSiblings (person, divider) {
    // returns markup containing siblings of person, with links
    // divider is markup or string to be added between each name
    // console.log('getSiblings(',person,')')
    
    siblings = '<ul>'
    // get the id of the parent
    if (db[person].father && db[db[person].father]) parent = db[db[person].father]
    else if (db[person].mother && db[db[person].mother]) parent =db[db[person].mother]
    
    if (parent && parent.fg) {
        // go through the list of families for the parent
        for (i=0;i<parent.fg.length;i++) {
            // go through the children in each family
            for (j=2;j<parent.fg[i].length;j++) {
                if ((s = parent.fg[i][j]) !== person && db[s]) {
                    
                    // add the sibling
                    siblings += `<li>${ getName('', s, 'given', true, '') }</li>`
                    }
                }
            }
        }
    siblings += '</ul>'
    return siblings
    }








// ===================================================
// ================== MAIN FUNCTION ================
// ======================================================
// redisplay(document.getElementById('in').textContent,thisPerson,document.getElementById('summaryIn'))

function redisplay (researchNotes, id, summary ) { 
    if (trace) console.log(enter, 'redisplay(researchNotes='+researchNotes+' id='+id+' summary='+summary+'['+summary.textContent+']'+')')
    //researchNotes: text read in from individual's txt file 
    //id: same as the global variable thisPerson (should eliminate it)
    //summary: ?
    //global.thisPerson: the id of the person this page is about

    var person
    
    person = db[thisPerson]  // points to the node in the db for thisPerson, will have other properties bound to it
    var p = db[thisPerson]  // obsolete this in favour of person
    var o = {} // contains data for a relative described by an event
    
    personID = id // this is to test the buttons at the bottom
    
	var out = ''
	var thumb = ''
	var thumbLegend = ''
	var gps = []


	// establish some basic information about the person the page is about
	person.given = getName('', id, 'k', false)
	person.fullname = getName('', id, 'gkf', false)
	if (person.male) { person.pron = 'He'; person.refpron = 'himself'; person.posspron = 'His'; }
	else  { person.pron = 'She'; person.refpron = 'herself'; person.posspron = "Her"; }
	temp = thumb.split(',')
	if (temp.length>1) { thumb = temp[0]; thumbLegend = temp[1]; }
	else thumbLegend = person.fullname






	// CREATE THE TOP BOILERPLATE +++++++++++++++++++++++++++++++++++++++++++++++++++++++
	
    // make the controls on the bottom line
	var dob = id.split('_')
	out += '<div id="topMenu">'
	//out += '<a id="gotoTop" href="#top">Go to Top</a>'
	out += '<span id="summarise" onclick="summarise(this, thisPerson)">Show lists</span>'
	out += '<span id="toggleDetails" onclick="toggleDetails(this)">Show sources</span>'
	out += '<span id="toggleEvents" onclick="toggleHistory(this, '+dob[dob.length-1]+')">Show history</span>'
	out += '<span id="toggleRelatives" onclick="toggleRelatives(this)" title="Hide/show relatives other than the nuclear family.">Hide relatives</span>'
	out += '<span id="applyTerse" onclick="terse()" title="Remove all relatives other than spouse\'s death.">Hide more</span>'
	//out += '<span id="minimiseToggle" onclick="addHistory(this, '+dob[dob.length-1]+')">Show history</span>'
    //out += `<button id="editLink" style="float: right; font-style: italic; margin-inline-end: 5rem; font-size: 90%; margin-block-start: .25rem;" onClick="openWindow(\'lib/forms/personentry.html?project=${ project }&person=${ thisPerson }')">Edit</button>`
    out += `<label  style="float: right; color:gray; margin-inline-end: 5rem; margin-block: 0; display:inline-block;" title="Bring up an input form to create or modify data.">EDIT 
    <select id="editSelect" style="font-size: 90%; font-style:italic; line-height:1; margin-inline:.5rem; background-color:#eee;"
    onchange="if (this.value !== '' && this.value !== 'personentry') openWindow(\'lib/forms/'+this.value+'.html?project=${ project }&person=${ thisPerson }'); else if (this.value === 'personentry') openWindow(\'lib/forms/personentry.html?project=${ project }'); this.value=''">
        <option value="">&nbsp;</option>
        <option value="personentry">New person</option>
        <option value="birthentry">Birth</option>
        <option value="dthentry">Death</option>
        <option value="marriageentry">Marriage</option>
        <option value="evententry">Event</option>
        <option value="censusentry">New census</option>
        </select></label>`
    if (db[id].tagged) out += `<span style="float: right; color:gray; display:inline-block;" title="This person has been tagged.">TAGGED <span style="font-size: 140%; line-height:1; margin-inline:.5rem;">\u2713</span></span>`
    out += '</div>'


    // do the floating links
    out += '<div id="floatingLinks">'
	out += '<a title="Go to the Index." href="index.html?project='+project+'">&#x1F4C7;</a> '

    out += '<a id="gotoTree" title="Show Relationships" href="tree.html?project='+window.project+'&person='+id+'">&#x23F3;</a>'
     
	out += '<a title="Show Ancestors" style="opacity:80%;" href="precedents.html?person='+id+'&project='+project+'">&#x23EB;</a> '
   
	out += '<a title="Show Descendants." style="opacity:80%;" href="descendants.html?person='+id+'&project='+project+'">&#x23EC;</a> '
    
	out += '<a title="Show Family Tree" href="ancestors.html?person='+id+'&project='+project+'">&#x1F333;</a> '
    
	out += '<a title="Search for entries containing a word" target="searchWindow" href="search.html?person='+id+'&project='+project+'">&#x1F50D;</a> '
    
	out += `<a title="Copy id to clipboard" style="opacity:80%;" href="javascript:void(0)"><img 
                src="lib/i/copytiny.svg" 
                style="height:1em; width:1em;" onclick="navigator.clipboard.writeText('${ id }'); document.getElementById('copyNotice').style.display = 'block'; setTimeout(() => { document.getElementById('copyNotice').style.display = 'none' }, '500')"></a> `
    
	out += `<img 
                src="lib/i/edit.svg" 
                style="margin-block: 4rem; height:1em; width:1em;" onclick="openWindow(\'lib/forms/personentry.html?project=${ project }&person=${ thisPerson }')">`

    if (db[id].tagged) out += `<span title="This person has been tagged." style="font-size: 100%; line-height:1; color:brown;">\u{2713}</span>`

    out += '</div>'


    out += '<div id="top"></div>'
	
	
	// popup window for summary
	//out += '<div style="position:absolute; background-color:white; margin:auto;padding: 2em;border:1px solid #ccc;border-radius:1em;display:none; max-width: 70%;top: 20em;box-shadow: 10px 5px 5px gray;left: 9%;" id="summaryWin"></div>'
	out += `<div id="summaryWin"></div>`
	




    // SET THE PAGE TITLE & BARS BELOW +++++++++++++++++++++++++++++++++++++++++++
    
	// set the page title
	document.querySelector('title').textContent = getName('', thisPerson, 'gf', false)
	
	// draw top banner
	out += '<div id="pageicon">📄</div><div id="banner"><div id="pagetitle">'+getName('', thisPerson, 'gfm', false)+'<br><span id="bannerdates">'+person.b+'\u2013'+person.d
	if (person.occ) out += ' \u2022 '+person.occ
	out += '</span></div></div>'

    // gather data
    var sid = []  // list of spouse ids
	var cid = []  // list of child ids
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

    // make up the set of people connected to the root, if any
    makeMarkList()

    // list parents
	out += '<div id="subbanner"><div>Parents: &nbsp; '
	if (person.father) {
        if (markList.has(person.father)) rootConnected = ` class="rootConnected"`
        else rootConnected = ''
        out += `<span ${ rootConnected }><img src="lib/i/copytiny.svg" style="height:1em; width:1em;" onclick="copyThis('${ person.father }')"> ${ getName('', person.father, 'both', true) }</span>`
        }
	if (person.mother && person.father ) out += ' \u00A0 '
	//if (person.mother && person.father ) out += ' \u2022 '
	if (person.mother) {
        if (markList.has(person.mother)) rootConnected = ` class="rootConnected"`
        else rootConnected = ''
        out += `<span ${ rootConnected }><img src="lib/i/copytiny.svg" style="height:1em; width:1em;" onclick="copyThis('${ person.mother }')"> ${ getName('', person.mother, 'both', true) }</span>`
        }
	if (!person.mother && !person.father) out += 'Unknown'
	out += ' </div></div>'

	// list spouses
	out += '<div id="subsubbanner"><div>Spouse: &nbsp; '
	if (sid.length > 0) {
		for (c=0;c<sid.length;c++) {
            if (markList.has(sid[c])) rootConnected = ` class="rootConnected"`
            else rootConnected = ''
			out += `<span ${ rootConnected }><img src="lib/i/copytiny.svg" style="height:1em; width:1em;" onclick="copyThis('${ sid[c] }')"> ${ getName('', sid[c], 'both', true) }</span>`
			if (c<sid.length-1) out += ' \u00A0 '
			//if (c<sid.length-1) out += ' \u2022 '
			}
		}
    else if (typeof person.cstatus !== 'undefined') out += 'None'
    else out += '??'
	out += '</div></div>'
    sid = ''

	// list children
	out += '<div id="subsubsubbanner"><div>Children: &nbsp; '
	temp = []
	if (cid.length > 0) {
		for (c=0;c<cid.length;c++) {
			if (cid[c] === 'a_child') {
				temp.push('<span>Private</span>')
				}
			else if (cid[c] === 'noissue') {}
			else {
                if (markList.has(cid[c])) rootConnected = ` class="rootConnected"`
                else rootConnected = ''
				temp.push(`<span ${ rootConnected }><img src="lib/i/copytiny.svg" style="height:1em; width:1em;" onclick="copyThis('${ cid[c] }')"> ${ getName('', cid[c], 'given', true) }</span>`)
				}
			}
		}
	for (i=0;i<temp.length;i++) {
		out += temp[i]
		if (i<temp.length-1) out += ' \u00A0 '
		//if (i<temp.length-1) out += ' \u2022 '
		}

	if (temp.length === 0) {
        if (typeof person.cstatus !== 'undefined') out += 'None'
        else out += '??'
        }
	out += '</div></div>'
    cid = ''







    // DISPLAY THE GENERAL INFORMATION  +++++++++++++++++++++++++++++++++++++++++++
    
	out += '<div id="main">'
	out += '<div class="dateAndRecord">'
	out += '<div id="summary" class="record"><div><p>'
	//out += '<div class="dateAndRecord"><div><div class="recordDate"><span style="font-size: 100%; margin-top:.8em;">'+person.b+'-</span><span>'+person.d+'</span></div></div><div id="summary" class="record"><div><p>'
	if (person.thumb) out += '<img class="portrait" src="'+project+'/thumbs/'+id+'.jpg" alt="'+thumbLegend+'" title="'+thumbLegend+'">'
	else if (person.male) out += '<img class="portrait" src="lib/i/man_pic.png" alt="'+thumbLegend+'" title="'+thumbLegend+'">'
	else  out += '<img class="portrait" src="lib/i/woman_pic.png" alt="'+thumbLegend+'" title="'+thumbLegend+'">'


    // create the life summary
    if (person.intro) {
        var intro = `<p>${ person.intro }</p>`
        if (person.cstatus) intro += '<p style="color:#aaa; text-align:center;margin-top:1em;">&#x2014; '+person.cstatus+' &#x2014;</p>'
        }
    else {
        intro = getName('', id, 'gfm', false)
        if (person.k) intro += ', known as '+person.k+', '
        if (person.b) intro += ' was born in '+person.b
        if (person.bplace) intro += ' at '+person.bplace
        intro += '. '
        if (person.fg) {
            for (i=0;i<person.fg.length;i++) {
                // deal with no date partnerships (ie. no marriage)
                if ((person.fg[i][0] === '' || person.fg[i][1] === '?') && person.fg[i].length > 2) {
                    intro += person.pron+' had '
                    if (person.fg[i].length === 3) intro += ' one child'
                    else intro += person.fg[i].length-2+' children'
                    if (person.fg[i][1] !== '' && person.fg[i][1] !== '?') intro += ` with ${ getName('', person.fg[i][1], 'gf', false) }`
                    intro += '. '
                    }                  
          
                else {
                    intro += person.pron+' married '+getName('', person.fg[i][1], 'gf', false)+' in '+person.fg[i][0].substr(0,4)
                    if (person.fg[i].length > 2) {
                        intro += ' and we know of '
                        if (person.fg[i].length === 3) intro += ' one child'
                        else intro += person.fg[i].length-2+' children'
                        }
                    //else intro += ' but we have no record of any children'
                    else if (person.cstatus) intro += ` but they had no children`
                    else intro += ` but we have not found any children`
                    intro += '. '
                    }
                }
            }
        if (person.occ) {
            var occupations = person.occ.split(',')
            intro += person.posspron+' occupations included '
            for (i=0;i<occupations.length;i++) {
                if (i === occupations.length-1 && i>0) intro += ' and '
                else if (i>0) intro += ', ' 
                intro += occupations[i]
                }
            intro += '. '
            }
        if (person.d) {
            intro += person.pron+' died in '+person.d
            if (person.dplace) intro += ' at '+person.dplace
            var ed = ey = bd = by = '?'
            if (person.b) {
                var age = getAge('', person.ddate, person.d, person.bdate, person.b, '')
                if (age === '0') intro += ', less than a year old'
                else intro += ' aged ' + getAge('', person.ddate, person.d, person.bdate, person.b, '')
                }
            intro += '. '
            intro = intro.replace('~',' about ')
            }
        intro += '</p>\n'
        if (person.cstatus) intro += '<p style="color:#aaa; text-align:center;margin-top:1em;">&#x2014; '+person.cstatus+' &#x2014;</p>'
        }
    
    // add warnings for provisional data
    if (person.provisional && person.warning) intro += `<img style="float:left; margin-inline-end:1rem; margin-block:.5rem;" src="lib/i/caution.png" alt="Caution" title="Cautionary notes."><p style="font-style:italic; font-size: 80%; font-family: serif;"> ${ person.warning }</p>`
    
    summary.innerHTML = intro

    out += summary.innerHTML+'</div></div><div class="keypoints">'
	
	// add the general links
	if (data[id] && data[id].links) {
		for (i=0;i<data[id].links.length;i++) {
			out += '<p><a href="'+data[id].links[i].url+'" target="_blank">'+data[id].links[i].title+'</a></p>'
			}
		}
	//else out += '\u00A0'
	else out += ''
    
    // list siblings
    out += `<div id="allSiblings"><span style="font-size: 90%; display:inline-block;margin-block-end:.2rem;">SIBLINGS:</span>`
    siblingList = getAllSiblings(thisPerson)
    if (siblingList !== '<ul></ul>') out += siblingList+'</div>'
    else out += '<br>\u2014'+'</div>'

	out += '</div></div>\n'
        
    


	
	// ESTABLISH A LIST OF EVENTS & TIME PERIOD FOR SELECTING THEM  ++++++++++++++++++++++++++++++++++++++
        
    var isoDate
    var dateOptions = { weekday:'long', day:'numeric', month:'short' }
    var withWeekday = { weekday:'long', day:'numeric', month:'short', year:'numeric' }


    // start with the list generated by checkBMD
    events = records
    
    // add the local events to the event list
    if (person.events) {
        keys = Object.keys(person.events)
        for (i=0;i<keys.length;i++) {
            events.push(keys[i]+'\tevent\t@\t'+person.events[keys[i]].type)
            }
        }
    
    events.sort()
    
    console.log('EVENTS',events)
    
    
    
    // establish a window of time for inclusion of events
    var periodStart = getTimestamp(person.bdate, person.b)
    if (periodStart == '') { // ie. no birth date found
        for (i=0;i<events.length;i++) { // check the ordered events list for a sign of life
            if (events[i].match('event\t|\tmarriage|\tson|\tdaughter|self\tdies')) {
                var temp = events[i].split(' ')
                periodStart = temp[0]
                break
                }
            }
        }
    var periodEnd = getTimestamp(person.ddate, person.d)
    if (periodEnd == '') { // ie. no birth date found
        if (person.upto) periodEnd = person.upto
        else {
            for (i=events.length-1;i>-1;i--) { // check the reverse-ordered events list for a sign of life
                if (events[i].match('event\t|\tmarriage|\tson|\tdaughter|\thusband|self\tborn')) {
                    var temp = events[i].split(' ')
                    periodEnd = temp[0]
                    break
                    }
                }
            }
        }

    
    
    //console.log(here,here,'periodStart',periodStart)
    //console.log(here,here,'periodEnd',periodEnd)

// THESE MAY NEED TO BE CHANGED TO birthTS and deathTS respectively, if actually used
    var birth = getTimestamp(person.bdate, person.b)
    var death = getTimestamp(person.ddate, person.d)







 	// WORK THROUGH EACH EVENT +++++++++++++++++++++++++++++++++++++++++++++++++++++++
    for (var e=0;e < events.length; e++) {
        var record = ''
        //var info = events[e]
        var details = ''
        
        // event carries information about the person the event relates to
        var event = {}
        parts = events[e].split('\t')
        event.timestamp = parts[0]
        event.dateObj = new Date(parts[0].replace(/-/g, '\/'))
        event.person = parts[1]
        event.relation = parts[2]
        event.type = parts[3]
       
        //event.year = event.timestamp.substr(0,4)
        event.year = event.dateObj.getFullYear().toString()
        
        event.title = ''
        event.background = ''
        event.border = ''
        event.useGPS = true

        if (trace) console.log('>>>> Loading event:', events[e])

        if (db[event.person] && event.person !== 'event' && ! event.person.includes('^')) {
            event.bdate = db[event.person].bdate
            event.b = db[event.person].b
            event.ddate = db[event.person].ddate
            event.d = db[event.person].d
            event.male = db[event.person].male
            }
        event.relative = ''

        if (event.male) { event.pron = 'He'; event.refpron = 'himself'; event.posspron = 'His'; }
        else  { event.pron = 'She'; event.refpron = 'herself'; event.posspron = "Her"; }

        if (trace) console.log('EVENT',event)
        
        
        // check whether we have the data, and whether the dates fall within the person's lifespan
        if (event.person !== 'event' && typeof db[event.person] === 'undefined' && ! event.person.includes('^') && ! event.relation.includes('spouse')) { 
            console.log(exit,'redisplay: Person undefined.', event.relation)
            continue 
            }
        if (event.timestamp < periodStart || event.timestamp > periodEnd) { 
            console.log(exit,'redisplay: Outside lifespan (periodStart,death=',periodStart,periodEnd,')')
            continue
            }






        if (event.type === 'census') {
            // add the census details to event
            if (trace) console.log('redisplay: Census ',person, person.events[event.timestamp])
            for (x in person.events[event.timestamp]) event[x] = person.events[event.timestamp][x]
            for (x in censi[event.census]) event[x] = censi[event.census][x]

            //console.log(here,here,'EVENT after census merge',event)

            isoDate = new Date(event.timestamp)
            event.date = new Intl.DateTimeFormat('en-GB', dateOptions).format(isoDate)
            event.date = new Intl.DateTimeFormat('en-GB', dateOptions).format(event.dateObj)
    
            if (event.discussion) {
                record += '<img class="commentaryIcon" src="lib/i/discn.png" alt="Commentary" title="Commentary notes for this event." onclick="alert(`' + event.discussion + '`)">'
                }
            if (event.caution) {
                record += '<img class="commentaryIcon" src="lib/i/caution.png" alt="Caution" title="Cautionary notes for this event." onclick="alert(`' + event.caution + '`)">'
                }
            //record += '<p>On '+event.date+' '+event.year+', '+person.given+getAge(' (aged ', event.date, event.year, person.bdate, person.b, ')')
            record += '<p>On '+event.date+' '+event.year+', '+person.given
            age = getAge('', event.date, event.year, person.bdate, person.b, '')
            if (age === '0') record += ' (aged less than a year)'
            else record += ' (aged '+age+')'
            record += ' was at '+event.place.split('http')[0].trim()+'. '


            if (event.head) event.head = event.head.split(';')[0]
            if (event.wife) event.wife = event.wife.split(';')[0]
            event.childnames = new Set([])
            if (event.children) for (i=0;i<event.children.length;i++) event.childnames.add(event.children[i].split(';')[0])


            //if (typeof event.head === 'undefined') record += ' There was no head of the family.'
            //console.log(here, here, here, 'event.head', event.head, 'event.wife', event.wife)
            
            record += ' The household included '
            if (event.head === thisPerson) {
                record += ' '+person.refpron
                }
            else if (event.wife === thisPerson) record += ' her husband '+getName('',event.head,'kf',true, event.timestamp)
            else record += getName('',event.head,'kfm',true, event.timestamp)
            
            if (event.wife == null && event.children == null && event.visitors == null && event.others == null && event.serv == null) record += ' alone'
            
            if (event.wife && event.children) record += ', '
            else if (event.wife) record += ' and '
            
            if (event.wife) {
                if (thisPerson === event.wife) record += ' '+person.refpron
                else record += ' his wife '+getName('',event.wife,'k',true, event.timestamp)
                }
            
            if (event.children) {
                if (event.children.length === 1) record += ' and 1 child'
                else record += ' and '+event.children.length+' children'
                if (event.childnames.has(thisPerson)) record += ' (including '+person.given+')'
                }
            record += '. '
            
            //if (event.childnames) console.log(here,here,here,'children',event.childnames,'this',thisPerson)

            if (event.others || event.visitors) {
                record += ' There '
                if (event.others) {
                    if (event.others.length === 1) { record += ' was also 1 other'; if (event.relation === 'other') record += ' ('+person.given+')' }
                    else if (event.others) { record += ' were '+event.others.length+' others'; if (event.relation === 'other') record += ' (including '+person.given+')' }
                    }
                if (event.others && event.visitors) record += ' and there '
                if (event.visitors) {
                    if (event.visitors.length === 1) { record += ' was also 1 visitor'; if (event.relation === 'visitor') record += ' ('+person.given+')' }
                    else if (event.visitors) { record += ' were also '+event.visitors.length+' visitors'; if (event.relation === 'visitor') record += ' (including '+person.given+')' }
                    }
                record += '.'
                }

            if (event.serv) { console.log(event.serv, event.relation)
                record += ' There '
                if (event.serv.length === 1) { 
                    record += ' was also 1 servant'
                    if (event.relation === 'serv') record += ' ('+person.given+')' }
                else if (event.serv) { 
                    record += ' were '+event.serv.length+' servants'
                    if (event.relation === 'serv') record += ' (including '+person.given+')' 
                    }
                record += '.'
                }
            record += '</p>'
            // get source data
            details = JSON.stringify(censi[event.census], ['source','place','head','wife','married','children','others','serv','visitors','cparish','details'], '\u200B').replace(/\{|\}/g,'').replace(/"/g,'')
            details = details.replace(/\u200B/g,'')
            var lines = details.split('\n')
            for (i=0;i<lines.length;i++) {
                if (lines[i].startsWith('source:') && lines[i].match('http')) {
                    parts = lines[i].split('http')
                    parts[0] = parts[0].replace(/source: /,'')
                    lines[i] = `<img src="lib/i/source.png" alt="Source link" title="Source link"><a target="_blank" href="http${ parts[1].replace(/,/g,'') }">${ parts[0] }</a>`
                    }
                if (lines[i].startsWith('place:') && lines[i].match('http')) {
                    parts = lines[i].split('http')
                    lines[i] = `${ parts[0] }`
                    }
                if (lines[i].startsWith('details:')) {
                    lines[i] = lines[i].replace(/\\n/g,' &nbsp; ').replace(/\\t/g,' ')
                    }
                }
            details = lines.join('\n')

/* original code
            // get source data
            details = JSON.stringify(censi[event.census], ['source','place','head','wife','married','children','others','serv','visitors','cparish','details'], '\u200B').replace(/\{|\}/g,'').replace(/"/g,'')
            var lines = details.split('\n')
            for (i=0;i<lines.length;i++) {
                if (lines[i].startsWith('\u200Bsource:') && lines[i].match('http')) {
                    parts = lines[i].split('http')
                    parts[0] = parts[0].replace(/source: /,'')
                    lines[i] = `<img src="lib/i/source.png" alt="Source link" title="Source link"><a target="_blank" href="http${ parts[1] }">${ parts[0] }</a>`
                    }
                }
            details = lines.join('\n')
*/

            if (event.notes) record += getNotes(event.notes, event.timestamp)
            if (event.fnotes) record += getFNotes(event.fnotes, event.timestamp)
            //event.notes = event.notes.split('\n')
            //for (n=0;n<event.notes.length;n++) if (event.notes[n] !== '') record += `<p>${ replaceNames(event.notes[n], event.timestamp) }</p>`
            if (event.discussion) {
                details += '<img src="lib/i/discn.png" alt="Commentary" title="Commentary notes for this event.">'+formatSource('',event.discussion)
                }
       
            event.useGPS = true
            event.title = 'Census'
            }
            



        if (event.type === 'born' && event.relation === 'self') {
            if (trace && person[events]) console.log('redisplay: Self birth ',person, person.events[event.timestamp])
            for (x in db[event.person].birth) event[x] = db[event.person].birth[x]
          
            siblingList = getSiblings(thisPerson, event.timestamp)

            // set date to bdate (which means no need to define date here)
            if (person && person.bdate) event.date = person.bdate
            else event.date = ''
            
            // check whether the birth date is based on the baptism date
            var goingByBap = false
            if (event.date && event.bapdate && event.date.match('~') && event.date.replace('~','') === event.bapdate) {
                goingByBap = true
                event.date = event.date.replace('~','onob ')
                }
            if (event.discussion) {
                record += '<img class="commentaryIcon" src="lib/i/discn.png" alt="Commentary" title="Commentary notes for this event." onclick="alert(`' + event.discussion + '`)">'
                }
            if (event.caution) {
                record += '<img class="commentaryIcon" src="lib/i/caution.png" alt="Caution" title="Cautionary notes for this event." onclick="alert(`' + event.caution + '`)">'
                }
            record += '<p>'+person.fullname+' was born '+getDatePhrase(event.date,event.b,withWeekday)
            if (goingByBap) {
                record += ' (the date of '+person.posspron.toLowerCase()+' baptism)'
                }
            //if (event.place) record += ' when the family resided at <span class="space">'+event.place.split('http')[0].trim()+'</span>'
            //if (event.place) record += ' at <span class="space">'+event.place+'</span>'
            record += getDBParents(', to ', thisPerson)
            if (event.place) record += ' when the family resided at <span class="space">'+event.place.split('http')[0].trim()+'</span>'
            record += '.'

            if (person.mother && db[person.mother]  && db[person.mother].f) {
                record += ' '+person.posspron+' mother\'s maiden name was '+db[person.mother].f+'.' 
                }
            if (event.informant) {
                informantText = replaceNames(event.informant)
                record += '<p>The informant on the birth certificate was '+informantText+'.</p>'
                }
            if (event.focc) {
                record += ' '+person.posspron+' father\'s occupation was '+event.focc+'.' 
                }
            record += '</p>'

            if (siblingList) {
                // get the number of siblings by checking the markup
                siblingLinks = siblingList.split('<a')
                if (siblingLinks.length === 1) record += '<p>'+person.pron+' had an elder sibling, '+getName('', siblingList[0].trim(), 'given', true)+'.</p>'
                else {
                    siblingCount = eval(siblingLinks.length-1)
                    if (siblingCount === 1) record += `<p>${ person.pron } had 1 elder sibling: ${ siblingList }`
                    else record += `<p>${ person.pron } had ${ siblingCount } elder siblings: ${ siblingList}`
                    //if (siblingCount === 1) record += '<p>'+person.pron+' had 1 elder sibling: '+siblingList
                    //else record += '<p>'+person.pron+' had '+siblingCount+' elder siblings: '+siblingList
                    record += '.</p>'
                    }
                }

            if (event.bapdate) {
                record += '<p>'+person.given+' was baptised '
                if (! goingByBap) {
                    if (event.bapyear) record += getDatePhrase(event.bapdate,event.bapyear)
                    else record += getDatePhrase(event.bapdate,year)
                    }
                if (event.bapplace) record += ' at '+event.bapplace.split('http')[0].trim()+'.'
                record += '</p>'
                }
            //if (event.notes && event.notes.length > 0) for (n=0;n<event.notes.length;n++) { record += '<p>'+replaceNames(event.notes[n])+'</p>' }
            if (event.notes) record += getNotes(event.notes, event.timestamp)
            if (event.fnotes) record += getFNotes(event.fnotes, event.timestamp)
            //if (event.fnotes && event.fnotes.length > 0) {
            //    record += '<div class="footnotes"><p>Notes</p><ol>'
            //    for (n=0;n<event.fnotes.length;n++) record += '<li>'+event.fnotes[n]+'</li>'
            //    record += '</ol></div>'
            //    }


            // settings for outside the main text
            event.title = 'Birth'
            
            event.useGPS = true
            
            details = formatSource(event.sources, event.discussion)
            
            if (typeof event.occ === 'undefined') event.occ = ''
           }




        else if (event.type === 'born') {
            // this is the birth of a relative
            if (trace && person[events]) console.log('redisplay: Birth ',person, person.events[event.timestamp])
            for (x in db[event.person].birth) event[x] = db[event.person].birth[x]

            if (event.discussion) {
                record += '<img class="commentaryIcon" src="lib/i/discn.png" alt="Commentary" title="Commentary notes for this event." onclick="alert(`' + event.discussion + '`)">'
                }
            if (event.caution) {
                record += '<img class="commentaryIcon" src="lib/i/caution.png" alt="Caution" title="Cautionary notes for this event." onclick="alert(`' + event.caution + '`)">'
                }
            record += '<p>'
            record += upperCaseFirst(event.relation) +' '
            record += getName('', event.person, 'kg', true)
            record += ' was born '
            
            //record += getDatePhrase(event.bdate,event.b)
            record += getDatePhrase(event.bdate,event.b,withWeekday)
            
            //if (db[event.person] && db[event.person].bdate) record += getDatePhrase(db[event.person].bdate,year)
            //else if (data[event.person] && data[event.person].birth && data[event.person].birth.date) record += getDatePhrase(data[event.person].birth.date,year)
            //else record += getDatePhrase('',year)
            
            if (event.place) record += ' at '+event.place.split('http')[0].trim() 
            if (birth) record += getAgeTS(', when '+person.given+' was ', event.timestamp, birth, ' years old')
            record += '.</p>'
            if (event.focc) {
                if (person.male) record += '<p>'+person.given+'\'s '
                else record += '<p>'+getName('', event.person, 'kx', true)+'\'s father\'s '
                record += ' occupation at the time was '+event.focc+'.</p>'
                }
            //if (event.notes && event.notes.length > 0) for (n=0;n<event.notes.length;n++) { record += '<p>'+replaceNames(event.notes[n])+'</p>' }
            if (event.notes) record += getNotes(event.notes, event.timestamp)
            if (event.fnotes) record += getFNotes(event.fnotes, event.timestamp)


            // prepare other settings
            //event.title = getName('', event.person, 'kg', true) + ' ' + event.type
           
            if (db[event.person] && db[event.person].birth) details = db[event.person].birth.sources

            if (event.relation.match('son|daughter|father|mother')) {}
            else event.background = 'other'

            if (event.relation.match('sister|brother')) {
                if (db[event.person].male) event.title = 'Brother '
                else event.title = 'Sister '
                }
            else event.title = ''
            event.title += getName('', event.person, 'kg', true) + ' ' + event.type

            
            event.useGPS = true
            
            details = formatSource(event.sources, event.discussion)
            
            if (event.focc && db[event.person].father === thisPerson) event.occ = event.focc
            }






        if (event.type === 'dies' && event.relation === 'self') {
            if (trace && person.events) console.log('redisplay: Death (self) ',person, person.events[event.timestamp])
            for (x in db[event.person].death) event[x] = db[event.person].death[x]

            event.useGPS = true
            event.title = 'Death'
            timestamp = new Date(event.timestamp)
            year = timestamp.getFullYear().toString()

            if (event.discussion) {
                record += '<img class="commentaryIcon" src="lib/i/discn.png" alt="Commentary" title="Commentary notes for this event." onclick="alert(`' + event.discussion + '`)">'
                }
            if (event.caution) {
                record += '<img class="commentaryIcon" src="lib/i/caution.png" alt="Caution" title="Cautionary notes for this event." onclick="alert(`' + event.caution + '`)">'
                }

            // overwrite event.date with thisPerson.ddate
            if (person.ddate) event.date = person.ddate
            else event.date = ''

            // check whether this is the burial date
            var goingByBur = false
            if (event.date && event.burdate && event.date.match('~') && event.date.replace('~','') === event.burdate) {
                goingByBur = true
                event.date = event.date.replace('~','onob ')
                }
            record += '<p>'+getName('', id, 'kfm', false)
            //if (event.of) record += ' of '+event.of
            record += ' died '+getDatePhrase(event.date,year)
            //if (event.place) record += ' at '+event.place
            if (goingByBur) {
                record += ' (the date of '+person.posspron.toLowerCase()+' burial)'
                }
            //if (event.place) record += ' at '+event.place
            //if (person.male) pron = 'he'; else pron = 'she'
            age = getAge('', event.date, year, person.bdate, person.b, '')
            if (age === '0') record += ' when '+person.pron.toLowerCase()+' was less than a year old'
            else record += ' when '+person.pron.toLowerCase()+' was '+age+' years old'
            //record += getAge(' when '+person.pron.toLowerCase()+' was ', event.date, year, person.bdate, person.b, ' years old')
            record += '. '
            if (event.cause) record += ' The cause was '+event.cause+'. '

            //if (event.of) record += ' '+person.posspron+' place of residence was '+event.of
            if (event.of) record += ' '+person.pron+' resided at '+event.of.split('http')[0].trim()
            if (event.of && event.place && event.place !== event.of) record += ', and '+person.pron.toLowerCase()+' died at '+event.place.split('http')[0].trim()
            else if (event.place) record += ' '+person.pron+' died at '+event.place.split('http')[0].trim()
            record += '.'
            
            if (event.occ) {
                if (person.male) record += ' His '; else record += ' Her '
                record += ' occupation at the time was '+event.occ.toLowerCase()+'. '
                }
            record += '</p>'
            //if (event.informant) record += '<p>The informant was '+event.informant+'.</p>'
            if (event.informant) {
                informantText = replaceNames(event.informant)
                record += '<p>The informant was '+informantText+'.</p>'
                }

            if (event.burdate || event.burplace) {
                if (person.male) record += '<p>He '; else record += '<p>She '
                record += ' was buried at '+event.burplace.split('http')[0].trim()
                if (! goingByBur && event.burdate) record += getDatePhrase(event.burdate,year)
                record += '.</p>'
                }
            if (event.gravestone) {
                if (person.male) record += '<p>His '; else record += '<p>Her '
                record += ' gravestone reads: <q>'+event.gravestone+'</q>.</p>'
                }
            if (event.probate) record += '<p>The probate index says: <q>'+event.probate+'</q>.</p>'
            if (event.namedInProbate) {
                var pnames = event.namedInProbate.split(',')
                var probatenames = ''
                for (w=0;w<pnames.length;w++) {
                    if (w>0) probatenames += ', '
                    if (w===pnames.length-1 && w>0) probatenames += 'and '
                    if (db[pnames[w].trim()]) probatenames += `${ getName('', pnames[w].trim(), 'kf', true) }` 
                    else  probatenames += `${ pnames[w].trim() }`
                    }
                record += `<p>Named in probate: ${ probatenames }.</p>`
                }
            if (event.obit) record += '<p>Obituary: <q>'+event.obit+'</q>.</p>'
            //if (event.notes && event.notes.length > 0) for (n=0;n<event.notes.length;n++) { record += '<p>'+replaceNames(event.notes[n])+'</p>' }
            if (event.notes) record += getNotes(event.notes, event.timestamp)
            if (event.fnotes) record += getFNotes(event.fnotes)
            //if (event.fnotes && event.fnotes.length > 0) {
            //    record += '<div class="footnotes"><p>Notes</p><ol>'
            //    for (n=0;n<event.fnotes.length;n++) record += '<li>'+event.fnotes[n]+'</li>'
            //    record += '</ol></div>'
            //    }
 
            details = formatSource(event.sources, event.discussion)
            event.border = 'death'
            event.titleColour = 'black'

            // clarify occupation for right panel
            if (typeof event.occ === 'undefined') event.occ = ''
            if (typeof event.of !== 'undefined') event.place = event.of
            if (typeof event.place === 'undefined') event.place = ''
           }






        // relative dies
        else if (event.type === 'dies') {
            if (trace && person.events) console.log('redisplay: Death ',person, person.events[event.timestamp])
            for (x in db[event.person].death) event[x] = db[event.person].death[x]

            if (event.discussion) {
                record += '<img class="commentaryIcon" src="lib/i/discn.png" alt="Commentary" title="Commentary notes for this event." onclick="alert(`' + event.discussion + '`)">'
                }
            if (event.caution) {
                record += '<img class="commentaryIcon" src="lib/i/caution.png" alt="Caution" title="Cautionary notes for this event." onclick="alert(`' + event.caution + '`)">'
                }

            record += '<p>'
            record += upperCaseFirst(event.relation) +' '
            switch (event.relation.toLowerCase()) {
                case 'grandfather':
                case 'grandmother': record += getName('', event.person, 'kfm', true); break
                default: record += getName('', event.person, 'k', true)
                }
            if (event.cause && event.cause.match(/killed/i)) record += ' was killed '
            else record += ' passed away '
            if (data[event.person] && data[event.person].death && data[event.person].death.date) record+= getDatePhrase(data[event.person].death.date,event.year)
            else if (db[event.person] && db[event.person].ddate) record+= getDatePhrase(db[event.person].ddate,event.year)
            else record+= getDatePhrase('',event.year)
            if (event.age) record += ', aged '+event.age+', '
            //if (event.place) record += ' at '+event.place+', ';
    
            age = getAgeTS('', event.timestamp, birth, '')
            if (age === '0') record += ' when '+person.given+' was less than a year old.'
            else record += ' when '+person.given+' was '+age+' years old.'
            //record += getAgeTS(' when '+person.given+' was ', event.timestamp, birth, ' years old.')
            
            //if (event.relation === 'husband') {
                if (event.of && event.place) record += ' '+getName('', event.person, 'kx', true)+' was living at '+event.of.split('http')[0].trim()+', and died at '+event.place.split('http')[0].trim()+'.'
                else if (event.of) record += ' '+getName('', event.person, 'kx', true)+' was living at '+event.of.split('http')[0].trim()+'.'
                else if (event.place) record += ' '+getName('', event.person, 'kx', true)+' died at '+event.place.split('http')[0].trim()+'.'
            //    }
            //else {
            //    if (event.of && event.place) record += ' '+getName('', event.person, 'kx', true)+' lived at '+event.of+', and died at '+event.place+'.'
            //    else if (event.of) record += ' '+getName('', event.person, 'kx', true)+' lived at '+event.of+'.'
            //    else if (event.place) record += ' '+getName('', event.person, 'kx', true)+' died at '+event.place+'.'
            //    }

            if (event.occ) record += ' '+event.posspron+' occupation was '+event.occ+'. '
            if (event.cause) record += ' '+getName('', event.person, 'given', true)+'\'s cause of death was '+event.cause+'. '
            record += '</p>'
            
            if (event.relation.match('father|mother') && event.burplace) record += `<p>${ getName('', event.person, 'kx', true) } was buried at ${ event.burplace.split('http')[0].trim() }</p>`
            
            if (event.informant) {
                informantText = replaceNames(event.informant)
                record += '<p>The informant was '+informantText+'.</p>'
                }
            if (event.probate && event.relation === 'husband') record += `The probate record has: <q>${ event.probate }</q>.`
            //if (event.notes && event.notes.length > 0) for (n=0;n<event.notes.length;n++) { record += '<p>'+replaceNames(event.notes[n])+'</p>' }
            if (event.notes) record += getNotes(event.notes, event.timestamp)
            if (event.fnotes) record += getFNotes(event.fnotes, event.timestamp)


            // prepare information for elsewhere
            if (db[event.person] && db[event.person].death) details = formatSource(event.sources, event.discussion)

            event.title = ''
            //if (event.relation.match('son|daughter')) event.title += event.relation+' dies'
            if (event.relation.match('father|mother')) {
                event.title += event.relation+' dies'
                event.titleColour = 'black'
                }
            else if (event.relation.match('brother|sister')) {
                event.title += event.relation+' dies'
                event.titleColour = '#444'
                }
            else {
                event.title = getName('', event.person, 'k', false) + ' ' + event.type
                event.titleColour = ''
                }
            
            if (event.relation.match('son|daughter|father|mother')) event.background = 'familydeath'
            else event.background = 'other'
            
            if (event.relation.match('wife|husband')) {
                event.title = getName('', event.person, 'k', false) + ' ' + event.type
                event.border = 'death'
                event.titleColour = 'black'
                event.background = 'familydeath'
                }
            
            event.place = ''
            event.occ = ''
            }







        if (event.type === 'marriage' && event.relation === 'spouse') {
            if (trace && person.events) console.log('REDISPLAY: Marriage ',person, person.events[event.timestamp])
            
            // find any data in person marriages (either in current or spouse record)
            var nodata = false
            
            //console.log('person', person)
            //console.log('event.person',event.person)
            
            if (person && person.marriages && person.marriages[event.person]) event = person.marriages[event.person]
            else if (db[event.person] && db[event.person].marriages && db[event.person].marriages[thisPerson]) event = db[event.person].marriages[thisPerson]
            else nodata = true
            // else alert('Marriage data not found!')
            // else out += '<p>Marriage data not found!</p>'
            
            //console.log('NODATA',nodata)
            
            if (nodata) {
                console.log(person)
                record += '<p>'+person.given+' married '
                if (event.person === '?' || event.person === '') record += 'an unknown person'
                else if (db[event.person]) record += getName('', event.person, 'gkf', true, event.timestamp)
                else record += event.person
                
                if (event.date) record+= getDatePhrase(event.date,year)
                record += ' when '+person.pron.toLowerCase()+' was '+getAgeTS('', event.timestamp, birth, '')+' years old'
                record += '. '
                console.log(record)

                event.title = 'Marriage to '+getName('', event.person, 'gkf', true, '')
                }
            
            else {
            year = event.timestamp.substr(0,4)
        
            if (event.discussion) {
                record += '<img class="commentaryIcon" src="lib/i/discn.png" alt="Commentary" title="Commentary notes for this event." onclick="alert(`' + event.discussion + '`)">'
                }
            if (event.caution) {
                record += '<img class="commentaryIcon" src="lib/i/caution.png" alt="Caution" title="Cautionary notes for this event." onclick="alert(`' + event.caution + '`)">'
                }
            
            // we should deprecate use of marriagetype
            // if there was no marriage, the fg list should start with a comma
            // and a note should be added to indicate the start of the relationship
            if (event.marriagetype === 'unmarried') {
                record += '<p>'+person.given+' began a relationship with '
                if (person.male) record += getName('', event.bid, 'gkf', true, event.timestamp)
                else record += getName('', event.gid, 'both', true, event.timestamp)
                record += ' at '+event.place.split('http')[0].trim()+', '
                if (event.date) record+= getDatePhrase(event.date,year)
                //if (person.male) pron = 'he'; else pron = 'she'
                record += ' when '+person.pron.toLowerCase()+' was '+getAgeTS('', event.timestamp, birth, '')+' years old'
                record += '. '
                //if (person.male) record += getName('', event.bid, 'gkf', true)+' was '+getAgeTS('', event.timestamp, db[event.bid].bdate+' '+db[event.bid].b, ' years old')
                //else record += getName('', event.gid, 'gkf', true)+' was '+getAgeTS('', event.timestamp, db[event.gid].bdate+' '+db[event.bid].b, ' years old')
                }
            else {
                record += '<p>'+person.given+' married '
                if (person.male) record += getName('', event.bid, 'gkf', true, event.timestamp)
                else record += getName('', event.gid, 'gf', true, event.timestamp)

                if (event.place) record += ' at '+event.place.split('http')[0].trim()+', '
                if (event.date) record+= getDatePhrase(event.date,year)
                //if (person.male) pron = 'he'; else pron = 'she'
                record += ' when '+person.pron.toLowerCase()+' was '+getAgeTS('', event.timestamp, birth, '')+' years old'
                //record += getAgeTS(' when '+person.pron.toLowerCase()+' was ', event.timestamp, birth, ' years old')
                record += '. '
                }

            if (event.bage || event.bstatus || event.gocc || event.bocc || event.bparish || event.gparish) record += '<p>'
            if (person.male) {
                if (event.bage) record += 'The bride was '+event.bage+' years old'
                if (event.bage && event.bstatus) record += ' and a '+event.bstatus
                else if (event.bstatus) record += ' The bride was a '+event.bstatus
                if (event.bage || event.bstatus) record += '. '
                }
            else {	
                if (event.gage) record += ' The groom was '+event.gage+' years old'
                if (event.gage && event.gstatus) record += ' and a '+event.gstatus
                else if (event.gstatus) record += ' The groom was a '+event.gstatus
                if (event.gage || event.gstatus) record += '. '
                }

            if (event.gocc) record += getName('', event.gid, 'k', true)+'\'s occupation was '+event.gocc+'. '
            if (event.bocc) record += getName('', event.bid, 'k', true)+'\'s occupation was '+event.bocc+'. '

            if (event.bparish && event.bparish === event.gparish) {
                if (event.gparish==='otp') record += ' Both were of this parish. '
                else record += ' Both were living at '+event.bparish.split('http')[0].trim()+'. '
                }
            else {
                if (event.bparish) {
                    if (event.bparish==='otp') record += ' The bride was of this parish'
                    else record += ' The bride was from '+event.bparish.split('http')[0].trim()
                    }
                if (event.gparish && event.bparish) record += ' and the '
                else if (event.gparish) record += '. The '
                if (event.gparish) {
                    if (event.gparish==='otp') record += ' groom was of this parish'
                    else record += ' groom was from '+event.gparish.split('http')[0].trim()
                    }
                if (event.bparish || event.gparish) record += '. '
                }
            if (event.bage || event.bstatus || event.gocc || event.bocc || event.bparish || event.gparish) record += '</p>'
            if (event.bfid || event.gfid) record += '<p>'
            if (person.male) {
                if (event.bfid) record += ' The bride\'s father was '+getName('', event.bfid, 'gf', true)
                else if (event.bfather) record += ' The bride\'s father was '+event.bfather
                if (event.bfocc) record += ', and his occupation '+event.bfocc
                if (event.bfid || event.bfather) record += '. '
                if (event.gfocc) record += person.given+'\'s father\'s occupation was '+event.gfocc+'. '
                }
            else {
                if (event.gfid) record += ' The groom\'s father was '+getName('', event.gfid, 'gf', true)
                else if (event.gfather) record += ' The groom\'s father was '+event.gfather
                if (event.gfocc) record += ', and his occupation '+event.gfocc
                if (event.gfid || event.gfather) record += '. '
                if (event.bfocc) record += person.given+'\'s father\'s occupation was '+event.bfocc+'. '
                }
            if (event.bfid || event.gfid) record += '</p>'

            if (event.witnesses) {
                var wits = event.witnesses.split(',')
                var witnesses = ''
                for (var w=0;w<wits.length;w++) {
                    if (w>0) witnesses += ', '
                    if (w===wits.length-1) witnesses += 'and '
                    if (db[wits[w].trim()]) witnesses += `${ getName('', wits[w].trim(), 'kf', true) }` 
                    else  witnesses += `${ wits[w].trim() }`
                    }
                }
            if (event.by && event.witnesses) record += '<p>They were married by '+event.by+' and the witnesses were '+witnesses+'.<p>'
            else { 
                if (event.by) record += '<p>They were married by '+event.by+'.<p>'
                if (event.witnesses) record += '<p>Witnesses were '+witnesses+'.<p>'
                }

            if (db[event.bid] && db[event.gid] && db[event.bid].d && db[event.gid].d) {
                var marrLength = Math.min(db[event.bid].d, db[event.gid].d) - parseInt(event.timestamp.substr(0,4))
                if (marrLength < 1) record += '<p>They were to be married for less than a year.</p>'
                else if (marrLength === 1) record += '<p>They were to be married for about a year.</p>'
                else {
                    if (event.marriagetype === 'unmarried') record += '<p>They were together for around '+marrLength+' years.</p>'
                    else record += '<p>They were to be married for around '+marrLength+' years.</p>'
                    }
                }
            if (event.notes) record += getNotes(event.notes, event.timestamp)
            if (event.fnotes) record += getFNotes(event.fnotes, event.timestamp)


            // stuff for display alongside the main text
            details = formatSource(event.sources, event.discussion)

            event.useGPS = true
  
            //if (event.marriagetype === 'unmarried') event.title = 'Relationship with '
            //else event.title = 'Marriage to '
            //event.title += getName('', event.person, 'kg', true)
            if (event.marriagetype === 'unmarried') {
                if (person.male) event.title = 'Relationship with '+event.bride
                else event.title = 'Relationship with '+event.groom
                }
            else {
                if (person.male) event.title = 'Marriage to '+event.bride
                else event.title = 'Marriage to '+event.groom
                }
            }

            // get occupation for display in right panel
            if (person.male && event.gocc) event.occ = event.gocc
            else if (event.bocc) event.occ = event.bocc
            else event.occ = ''
            event.border = 'marriage'
            event.type = 'marriage'
            event.relation = 'self'
            
            /*/ set the place to their abode
            if (person.male && event.gparish) event.place = event.gparish
            else if (event.bparish) event.place = event.bparish*/
            }





        // RELATIVE MARRIES
        else if (event.type == 'marriage') {
            
            // find the event data
            var ptr = null
            var couple = event.person.split('^')
            if (db[couple[0]] && db[couple[0]].marriages && db[couple[0]].marriages[couple[1]]) ptr = db[couple[0]].marriages[couple[1]]
            else if (db[couple[1]] && db[couple[1]].marriages && db[couple[1]].marriages[couple[0]]) ptr = db[couple[1]].marriages[couple[0]]
            // else alert('Couple data not found!')
            for (x in ptr) event[x] = ptr[x]
            
            if (event.discussion) {
                record += '<img class="commentaryIcon" src="lib/i/discn.png" alt="Commentary" title="Commentary notes for this event." onclick="alert(`' + event.discussion + '`)">'
                }
            if (event.caution) {
                record += '<img class="commentaryIcon" src="lib/i/caution.png" alt="Caution" title="Cautionary notes for this event." onclick="alert(`' + event.caution + '`)">'
                }

            record += '<p>'
            if (event.relation === 'daughter') { 
                record += person.given+'\'s daughter '+getName('', event.bid, 'kg', true, event.timestamp)+' married '+getName('', event.gid, 'gkf', true)+getDatePhrase(event.date,event.timestamp.substr(0,4))
                if (event.place) record += ' at '+event.place.split('http')[0].trim()
                record += '.</p>'
                }
            if (event.relation.toLowerCase() === 'son') {
                record += person.given+'\'s '+event.relation.toLowerCase()+' '+getName('', event.gid, 'given', true, event.timestamp)+' married '+getName('', event.bid, 'both', true)+getDatePhrase(event.date,event.timestamp.substr(0,4))
                if (event.place) record += ' at '+event.place.split('http')[0].trim()
                record += '.</p>'
                }
            if (event.relation.toLowerCase() === 'father') {
                record += person.given+'\'s '+event.relation.toLowerCase()+' '+getName('', event.gid, 'given', true, event.timestamp)+' married '+getName('', event.bid, 'both', true)+getDatePhrase(event.date,event.timestamp.substr(0,4))
                if (event.place) record += ' at '+event.place.split('http')[0].trim()
                record += '.</p>'
                }
            if (event.relation.toLowerCase() === 'mother') {
                record += person.given+'\'s '+event.relation.toLowerCase()+' '+getName('', event.bid, 'given', true, event.timestamp)+' married '+getName('', event.gid, 'both', true)+getDatePhrase(event.date,event.timestamp.substr(0,4))
                if (event.place) record += ' at '+event.place.split('http')[0].trim()
                record += '.</p>'
                }

            if (event.relation.toLowerCase() === 'daughter' && event.gfid) {
                record += '<p>The father of the groom was '+getName('', event.gfid, 'both', true)
                if (event.gfocc) record += ', '+event.gfocc
                record += '. '
                if (event.bfocc) record += ' The occupation of '+getName('', event.bfid, 'both', true)+' was '+event.bfocc+'. '
                record += '</p>'
                }
            if (event.relation.toLowerCase() === 'son' && event.bfid) {
                record += '<p>The father of the bride was '+getName('', event.bfid, 'both', true)
                if (event.bfocc) record += ', '+event.bfocc
                record += '. '
                if (event.gfocc) record += ' The occupation of '+getName('', event.gfid, 'both', true)+' was '+event.gfocc+'. '
                record += '</p>'
                }
            /* if (event.relation === 'son' && event.bfather) {
                record += '<p>The father of the bride was '+getName('', event.bfather, 'both', true)
                if (event.bfocc) record += ', '+event.bfocc
                record += '. '
                if (event.gfocc) record += ' The occupation of '+getName('', event.gfid, 'both', true)+' was '+event.gfocc+'. '
                record += '</p>'
                }*/
            else if (event.relation === 'son' && event.bfather) {
                record += '<p>The father of the bride was '+event.bfather
                if (event.bfocc) record += ', '+event.bfocc
                record += '. '
                if (event.gfocc) record += ' The occupation of '+getName('', event.gfid, 'both', true)+' was '+event.gfocc+'. '
                record += '</p>'
                }
            if (event.notes) record += getNotes(event.notes, event.timestamp)
            if (event.fnotes) record += getFNotes(event.fnotes, event.timestamp)
            event.background = 'other'


            // prepare information for elsewhere
            if (event.sources) details = formatSource(event.sources, event.discussion)
            
            //if (event.relation === 'son') event.title = `<span style="font-size:90%; white-space: normal;">${ event.groom } marries ${ event.bride }</span>`
            //else event.title = `<span style="font-size:90%; white-space: normal;">${ event.bride } marries ${ event.groom }</span>`
            
            if (event.relation === 'son') event.title = `<span style="font-size:90%; white-space: normal;">${ getName('', event.gid, 'k', true) } marries ${ event.bride }</span>`
            else event.title = `<span style="font-size:90%; white-space: normal;">${ getName('', event.bid, 'k', true) } marries ${ event.groom }</span>`
            

            // get the parent's occupation, checking gender
            //if (event.relation === 'son' && event.gfocc) event.occ = event.gfocc
            if (event.relation === 'son' && event.gfocc && person.male) event.occ = event.gfocc
            if (event.relation === 'daughter' && event.bfocc && person.male) event.occ = event.bfocc
            event.place = ''

            }





        if (event.type === 'note') {
            // add the census details to event
            if (trace) console.log('redisplay: Note ',person, person.events[event.timestamp])
            for (x in person.events[event.timestamp]) event[x] = person.events[event.timestamp][x]
            if (event.sharednote) for (x in notae[event.sharednote]) event[x] = notae[event.sharednote][x]

            console.log(here,here,'EVENT after notes merge',event)

            isoDate = new Date(event.timestamp)
            event.date = new Intl.DateTimeFormat('en-GB', dateOptions).format(isoDate)
            event.date = new Intl.DateTimeFormat('en-GB', dateOptions).format(event.dateObj)
    
            if (event.notes) record += getNotes(event.notes, event.timestamp)
            if (event.fnotes) record += getFNotes(event.fnotes, event.timestamp)
            
            //event.notes = event.notes.split('\n')
            //for (n=0;n<event.notes.length;n++) {
            //    if (event.notes[n] !== '') {
            //        if (event.notes[n].startsWith('intro:')) record += `<p class="noteIntro">${ replaceNames(event.notes[n].replace('intro: ',''), event.timestamp) }</p>`
            //        if (event.notes[n].startsWith('note:')) record += `<p>${ replaceNames(event.notes[n].replace('note: ',''), event.timestamp) }</p>`
            //        if (event.notes[n].startsWith('quote:')) record += `<p><q>${ replaceNames(event.notes[n].replace('quote: ',''), event.timestamp) }</q></p>`
            //        }
            //    }

            details = formatSource(event.sources, event.discussion)



            // prepare information for elsewhere
            if (db[event.person] && db[event.person].death) details = formatSource(event.sources, event.discussion)

            event.useGPS = true
            }




        if (event.type === 'figure') {
            // add the details to event
            for (x in person.events[event.timestamp]) event[x] = person.events[event.timestamp][x]
            console.log(here,here, here,events)
            record += `<figure><p><a href="${ project}/${ event.img }" target="_blank"><img src="${ window.project}/${ event.img }" alt=""/></a></p>`
            record += `<figcaption>${ event.caption}</figcaption></figure>`
            details = formatSource(event.sources, "")
            title = ''
            }





//. ****** NOTE THAT THE DETAILS PANEL USED TO INCLUDE LOTS OF LINKS TO IMAGES, GPS, ETC AND DISCUSSION TEXT. NOW THAT'S ONLY DISPLAYED VIA ICONS IN THE RIGHT SIDE PANEL. ALSO, DISPLAY DATA KEY-VALUE PAIRS ARE NO LONGER SHOWN.

// info needed coming into this section: event.title, details, event.type/occ/place


        // clarify occupation for right panel
        if (typeof event.occ === 'undefined') event.occ = ''
        //if (typeof event.of !== 'undefined') event.place = event.of
        if (typeof event.place === 'undefined') event.place = ''
        if (typeof event.timestamp === 'undefined') alert('event.timestamp undefined for '+events[e])


        // draw age + year 
		out += '<div class="dateAndRecord">'
        out += '<div><div class="recordDate"'
		if (event.type === 'background' || event.type === 'figure') out += ' style="background-color:transparent;">'
		else out += '><span class="recordDateAge">'+getAgeTS('', event.timestamp, birth, '')+'</span><span class="recordDateAge" style="font-size:1px;line-height:1px;"> &bull; </span><span class="theYear">'+event.timestamp.substr(0,4)+'</span>'
        out += '</div>'
        out += '</div>'
         
        //console.log('RELATION',event.relation)
        //console.log('RECORD TYPE',event.type)
        relationType = 'otherRelative'
        //if (event.relation === 'son' || event.relation === 'daughter' || event.relation === 'husband' || event.relation === 'wife' || event.relation === 'self' || event.relation === '@' || event.type === 'census') relationType = 'closeRelation'
        
        if (event.relation === 'son' || event.relation === 'daughter' || event.relation === 'husband' || event.relation === 'wife' || event.relation === '@') relationType = 'closeRelation'
        
        if (event.relation === 'self' || event.type === 'census') relationType = 'closeRelation selfRelation'
        
        out += '<div class="record '+relationType+' '+event.border+' '+event.background+'">'
        //out += '<div class="record '+event.relation+' '+event.border+' '+event.background+'">'
      
		// add the record title and any floating icons
		out += '<div class="titleEtc">\n'
		if (event.type !== 'background' && event.type !== 'figure') out += '<p class="recordTitleAge">'+getAgeTS('', event.timestamp, birth, '')+'</p>'
		out += '<p class="recordTitle"'
        if (event.titleColour) out += ` style="color:${ event.titleColour }"`
        out += '>'+event.title+'</p>'
        out += '</div>\n'
        
        out += '<div class="descriptionText">' + record + '</div>'
        
        if (event.type !== 'background' && event.type !== 'figure') out += '<details><summary></summary><pre>'+details+'</pre></details>'
        out += '</div>\n' // close record
        
        //keypoints here
        out += '<div class="keypoints kp'+event.type+'">'
		out += '<div class="occ">'+event.occ+'</div>'
		//out += '<div class="place">'+event.place.split('http')[0].trim()+'</div>'
        if (event.of) {
            out += `<div class="place"`
            if (event.athome) out += ` data-athome="${ event.athome }"`
            out += `>${ event.of.split('http')[0].trim() }</div>`
            }
        else if (event.place) {
            out += `<div class="place"`
            if (event.athome) out += ` data-athome="${ event.athome }"`
            out += `>${ event.place.split('http')[0].trim() }</div>`
            }
        if (person.male && event.gparish) out += '<div class="place">res: '+event.gparish.split('http')[0].trim()+'</div>'
        else if (event.bparish)  out += '<div class="place">res: '+event.bparish.split('http')[0].trim()+'</div>'
        
        // create the floated icon links
        floatedIcons = ''
        if (event.images) {
            for (j=0;j<event.images.length;j++) {
                floatedIcons += addFIcon(event.images[j],'record')
                }
            }
        
        //console.log(event)
        if (event.of && event.of.split('http')[1]) floatedIcons += addFIcon(event.of,'gps')
        else if (event.place && event.place.split('http')[1]) floatedIcons += addFIcon(event.place,'gps')
        if (person.male && event.gparish && event.gparish.split('http')[1]) floatedIcons += addFIcon(event.gparish,'gps')
        else if (event.bparish && event.bparish.split('http')[1]) floatedIcons += addFIcon(event.bparish,'gps')
        if (event.bapplace && event.bapplace.split('http')[1]) floatedIcons += addFIcon(event.bapplace,'gps')
        if (event.burplace && event.burplace.split('http')[1]) floatedIcons += addFIcon(event.burplace,'gps')
        
        if (event.gps) {
            for (j=0;j<event.gps.length;j++) {
                floatedIcons += addFIcon(event.gps[j],'gps')
                }
            }

        if (event.links) {
            for (j=0;j<event.links.length;j++) {
                floatedIcons += addFIcon(event.links[j],'link')
                }
            }
        out += `<div class="floatedIcons">${ floatedIcons }</div>`
        out += '<div style="font-size:60%">'+event.timestamp+'</div>'
        if (event.relation === 'self' || (event.type === 'marriage' && event.relation === 'self')) {
            // find the one with the marriage data
            if (event.bid || event.gid || event.person) {
                spouse = ''
                if (event.bid === id) spouse = event.gid
                else if (event.gid) spouse = event.bid
                else if (event.person) spouse = event.person
                href = `?project=${ project }&person=${ id }&spouse=${ spouse }`
                }
            else 
            href = `?project=${ project }&person=${ id }`
            switch (event.type) {
                case 'born': href = 'lib/forms/birthentry.html'+href; break
                case 'dies': href = 'lib/forms/dthentry.html'+href; break 
                case 'marriage': href = 'lib/forms/marriageentry.html'+href; break 
                default: href='neither'
                }
            out += `<div><a target="_blank" href="${ href }"><img src="lib/i/edit.svg" style="height:1.4rem;"></a></div>`
            }
        if (event.type === 'note') {
            href = `lib/forms/evententry.html?project=${ project }&person=${ id }&timestamp=${ event.timestamp }`
            out += `<div><a target="_blank" href="${ href }"><img src="lib/i/edit.svg" style="height:1.4rem;"></a></div>`
            }
        //console.log('EVENT',event.type)
        //console.log('Event',event)
        out += '</div>'
        out += '</div>\n'
        
        
        }





        // add research notes, if there are any
        if (researchNotes && researchNotes.trim() !== '') {
            researchNotes = researchNotes.replace(/(http(s)?:\/\/[^\s]+)/g, '<a href="$&" target="_blank">link</a>')
            out += '<details'
            if (localStorage.ancestryShowResearch == 'yes') out += ' open'
            out += '><summary '
            out += ' onclick="if (parentNode.open) {localStorage.ancestryShowResearch = \'no\';} else {localStorage.ancestryShowResearch = \'yes\';}"'
            out += ' style="text-align:center; margin-inline-end: 3em; margin-top: 2em; text-transform: uppercase; font-family: \'Source Sans Pro\', \'Helvetica Neue\', Arial, sans-serif; font-size: 100%; color:#666;">Notes &amp; research</summary>\n<p style="white-space: pre-wrap; font-size:90%;margin-inline:9rem;">'
            out += researchNotes
            out += '</p>\n</details>'
            }




    // create a list of places

    /*/ normalise the list
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
    */


	// list children
/*	out += '<div id="subsubsubbanner"><div>Siblings: '
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
*/
	// get siblings
/*
console.log("SIBLINGS",db[db[id].father].fg)

    function getSiblings (group, individual) { 
        var out = '<div class="children">Siblings: '
        for (var c=2;c<group.length;c++) {
            if (db[group[c]] && group[c] !== individual) {
                //out += getPersonDetails(group[c], 'child')
                if (c>2) out += ' \u2022 '
                out += getName('', group[c], 'given', true)
                }
            else if (group[c] !== individual) out += '<div class="child">'+group[c]+'</div>'
            }
        out += '</div>'

        return out
        }

   
	if (db[id].father && db[db[id].father].fg) {
        out += '<div id="subsubsubsubbanner"><div>'
		for (var ffg=0;ffg<db[db[id].father].fg.length;ffg++) {
			out += getSiblings(db[db[id].father].fg[ffg], id)
            }
		}
    else out += '<div id="subsubsubsubbanner">No siblings<div>'

*/



    // console.log("PLACES"+person.places)

    out += '<div id="places">'

    if (person.places) {
        placeRecords = person.places.split(',')
        console.log(placeRecords)
        placesOut = ''
        for (p=0;p<placeRecords.length;p++) {
            console.log(placesDB[placeRecords[p]])
            record = placeRecords[p].trim()
            if (typeof placesDB[record] === 'undefined') {
                console.log('Couldnt find:'+placeRecords[p])
                continue
                }
            if (placesDB[record].gps || placesDB[record].desc) {
                console.log("Going forward with:"+placeRecords[p])
                 placesOut += `<span class="placesRecord">${ placesDB[record].p }`
                 if (placesDB[record].desc) placesOut += `<a target="_blank" href="${ placesDB[record].desc }"><img src="lib/i/info.png" alt="Info"></a>`
                 if (placesDB[record].gps) placesOut += `<a target="_blank" href="${ placesDB[record].gps }"><img src="lib/i/map.png" alt="GPS"></a>`
                 placesOut += "</span>"
                 }
            }
        out += `<details open><summary>Places</summary><p>${ placesOut }</p></details>`
        }




    // show all events  REMOVED TEMPORARILY
    out += '<details id="networkList" style="display:none;"><summary>FAMILY NETWORK DATA</summary>'
    for (e=0;e<events.length;e++) {
        var eventfields = events[e].split('\t')
        //console.log('EVENTFIELDS', eventfields)
        out += `<p>${ eventfields[0] } ${ eventfields[2] } ${ eventfields[3] } ${ eventfields[1] } </p>`
        }
    out += '</details>'
    
    

    out += '</div>'
    
    
    
    
    out += '</div>' 

    if (trace) console.log(exit,'redisplay')
	return out
    }




function getNotes (notes, timestamp) {
    var record = ''
    notes = notes.split('\n')
    for (n=0;n<notes.length;n++) {
        if (notes[n] !== '') {
            if (notes[n].startsWith('intro:')) record += `<p class="noteIntro">${ replaceNames(notes[n].replace('intro: ',''), timestamp) }</p>`
            else if (notes[n].startsWith('note:')) record += `<p>${ replaceNames(notes[n].replace('note: ',''), timestamp) }</p>`
            else if (notes[n].startsWith('quote:')) record += `<p><q>${ replaceNames(notes[n].replace('quote: ',''), timestamp) }</q></p>`
            else record += `<p>${ replaceNames(notes[n], timestamp) }</p>`
            }
        }
    return record
    }


function getFNotes (notes) {
    var record = ''
    if (notes.length > 0) {
        record += '<div class="footnotes"><p>Notes</p><ol>'
        for (n=0;n<notes.length;n++) record += '<li>'+notes[n]+'</li>'
        record += '</ol></div>'
        return record
        }
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


function showProbatesX (person) {
    var out, allNames
    out = '<h4>Named in probate:</h4><ul>'
    allNames = Object.keys(db)
    allNames.forEach(name => { 
        if (db[name].death) {
            if (db[name].death.namedinprobate && db[name].death.namedinprobate.includes(person)) out += '<li>'+db[name].death.timestamp.substr(0,4) + ' '+getName('',name,'kf',false)+' '+name+'</li>'
            }
        })
    out += '</ul>'

    return out
    }


function showProbates (person) {
    var out, allNames
    out = '<h4>Named in probate:</h4><ul>'
    allNames = Object.keys(db)
    allNames.forEach(name => { 
        if (db[name].death && db[name].death.namedInProbate && db[name].death.namedInProbate.includes(person)) out += 
        `<li>${ db[name].death.timestamp.substr(0,4) } <a href="person.html?project=${ project }&person=${ name }" target="_blank">${ getName('',name,'kf',false) }</a></li>`
        })
    out += '</ul>'

    return out
    }


function showAppearsIn (person) {
    var out, allNames
    out = '<h4>Mentioned in:</h4><ul>'
    allNames = Object.keys(db)
    allNames.forEach(name => { 
        if (db[name].appearsIn && db[name].includes(person)) out += 
        `<li>${ db[name].timestamp.substr(0,4) } <a href="person.html?project=${ project }&person=${ name }" target="_blank">${ getName('',name,'kf',false) }</li>`
        })
    out += '</ul>'

    return out
    }


function showAppearsIn (person) {
    out = '<h4>Mentioned in:</h4><ul>'
    allNames = Object.keys(db)
    allNames.forEach(name => { 
        if (db[name].marriages) {
            var spouses = Object.keys(db[name].marriages)
            for (var i=0;i<spouses.length;i++) {
                if (db[name].marriages[spouses[i]].mentioned && db[name].marriages[spouses[i]].mentioned.includes(person)) out += 
                `<li>Marriage record: ${ db[name].marriages[spouses[i]].timestamp.substr(0,4)} <a href="person.html?project=${ project }&person=${ name }">${ getName('',name,'kf',false) }</a></li>`
                
                if (db[name].death && db[name].death.mentioned && db[name].death.mentioned.includes(person)) out += 
                `<li>Death record: ${ db[name].death.timestamp.substr(0,4) } <a href="person.html?project=${ project }&person=${ name }" target="_blank">${ getName('',name,'kf',false) }</a></li>`
                
                if (db[name].birth && db[name].birth.mentioned && db[name].birth.mentioned.includes(person)) out += 
                `<li>Death record: ${ db[name].birth.timestamp.substr(0,4) } <a href="person.html?project=${ project }&person=${ name }" target="_blank">${ getName('',name,'kf',false) }</a></li>`
                }
            }
        })
    out += '</ul>'

    return out
    }



function showInformantsX (person) {
    out = '<h4>Named as an informant:</h4><ul>'
    allNames = Object.keys(db)
    allNames.forEach(name => { 
        if (db[name].birth) {
            if (db[name].birth.informant && db[name].birth.informant.includes(person)) out += '<li>'+db[name].birth.timestamp.substr(0,4) + ' '+getName('',name,'kf',false)+' '+name+'</li>'
            }
        })
    allNames.forEach(name => { 
        if (db[name].death) {
            if (db[name].death.informant && db[name].death.informant.includes(person)) out += '<li>'+db[name].death.timestamp.substr(0,4) + ' '+getName('',name,'kf',false)+' '+name+'</li>'
            }
        })
    out += '</ul>'
    
    return out
    }



function showInformants (person) {
    out = '<h4>Named as an informant:</h4><ul>'
    allNames = Object.keys(db)
    allNames.forEach(name => { 
        if (db[name].birth) {
            if (db[name].birth.informant && db[name].birth.informant.includes(person)) out += `<li>${ db[name].birth.timestamp.substr(0,4) } <a href="person.html?project=${ project }&person=${ name }">${ getName('',name,'kf',false) }</a> birth</li>`
            }
        })
    allNames.forEach(name => { 
        if (db[name].death) {
            if (db[name].death.informant && db[name].death.informant.includes(person)) out += `<li>${ db[name].death.timestamp.substr(0,4) } <a href="person.html?project=${ project }&person=${ name }">${ getName('',name,'kf',false) }</a> death</li>`
            }
        })
    out += '</ul>'
    
    return out
    }


function showWitnesses (person) {
    out = '<h4>Named as witness:</h4><ul>'
    allNames = Object.keys(db)
    allNames.forEach(name => { 
        if (db[name].marriages) {
            var spouses = Object.keys(db[name].marriages)
            for (var i=0;i<spouses.length;i++) {
                //if (db[name].marriages[spouses[i]].witnesses && db[name].marriages[spouses[i]].witnesses.includes(person)) out += '<li>'+db[name].marriages[spouses[i]].timestamp.substr(0,4) + ' '+getName('',name,'kf',false)+' '+name+'</li>'
                if (db[name].marriages[spouses[i]].witnesses && db[name].marriages[spouses[i]].witnesses.includes(person)) out += 
                `<li>${ db[name].marriages[spouses[i]].timestamp.substr(0,4)} <a href="person.html?project=${ project }&person=${ name }">${ getName('',name,'kf',false) }</a></li>`
                }
            }
        })
    out += '</ul>'

    return out
    }


function showCensusEntries (person) {
    out = '<h4>Census entries:</h4><ul>'
    const BIRTHPLACE = 5
    const AGE = 2
    allNames = Object.keys(censi)
    allNames.forEach(name => { 
        if ((censi[name].head && censi[name].head.includes(person))) {
            out += `<li>${ name.substr(0,4)} head, <i>born at</i> ${ censi[name].head.split(';')[BIRTHPLACE] } <i>age</i> ${ censi[name].head.split(';')[AGE] }</li>`
            }
        if (censi[name].wife && censi[name].wife.includes(person)) {
            out += `<li>${ name.substr(0,4)} wife, <i>born at</i> ${ censi[name].wife.split(';')[BIRTHPLACE] } <i>age</i> ${ censi[name].wife.split(';')[AGE] }</li>`
            }
        if (censi[name].children) {
            for (i=0;i<censi[name].children.length;i++) if (censi[name].children[i].includes(person)) out += `<li>${ name.substr(0,4)} child, <i>born at</i> ${ censi[name].children[i].split(';')[BIRTHPLACE] } <i>age</i> ${ censi[name].children[i].split(';')[AGE] }</li>`
            }
        if (censi[name].others) {
            for (i=0;i<censi[name].others.length;i++) if (censi[name].others[i].includes(person)) out += `<li>${ name.substr(0,4)} other, <i>born at</i> ${ censi[name].others[i].split(';')[BIRTHPLACE] } <i>age</i> ${ censi[name].others[i].split(';')[AGE] }</li>`
            }
        if (censi[name].serv) {
            for (i=0;i<censi[name].serv.length;i++) if (censi[name].serv[i].includes(person)) out += `<li>${ name.substr(0,4)} servant, <i>born at</i> ${ censi[name].serv[i].split(';')[BIRTHPLACE] } <i>age</i> ${ censi[name].serv[i].split(';')[AGE] }</li>`
            }
        if (censi[name].visitors) {
            for (i=0;i<censi[name].visitors.length;i++) if (censi[name].visitors[i].includes(person)) out += `<li>${ name.substr(0,4)} visitor, <i>born at</i> ${ censi[name].visitors[i].split(';')[BIRTHPLACE] } <i>age</i> ${ censi[name].visitors[i].split(';')[AGE] }</li>`
            }
        })
    out += '</ul>'

    return out
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
	if (person.b) { records.push(getTimestamp(person.bdate, person.b)+'\t'+thisPerson+'\tself\tborn'); birth = getTimestamp(person.bdate, person.b) }
    //if (person.upto) { records.push(getTimestamp('31 Dec', person.upto.toString())+' '+thisPerson+' self upto'); death = getTimestamp('31 Dec', person.upto.toString()) }
	if (person.d) { records.push(getTimestamp(person.ddate, person.d)+'\t'+thisPerson+'\tself\tdies'); death = getTimestamp(person.ddate, person.d) }
	
		
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
                    if (db[parent.fg[i][j]].b !== '' && parent.fg[i][j] !== thisPerson) records.push(getTimestamp(db[parent.fg[i][j]].bdate, db[parent.fg[i][j]].b)+'\t'+parent.fg[i][j]+'\t'+type+'\tborn')
                    if (db[parent.fg[i][j]].d !== '' && parent.fg[i][j] !== thisPerson) records.push(getTimestamp(db[parent.fg[i][j]].ddate, db[parent.fg[i][j]].d)+'\t'+parent.fg[i][j]+'\t'+type+'\tdies')
					}
				}
			}
		}

	// get marriage
	if (person.fg) {
		for (i=0;i<person.fg.length;i++) {
            // get the timestamp
            marriageTimestamp = person.fg[i][0]
            if (person.marriages && person.marriages[person.fg[i][1]]) marriageTimestamp = person.marriages[person.fg[i][1]].timestamp
            else if (db[person.fg[i][1]] && db[person.fg[i][1]].marriages && db[person.fg[i][1]].marriages[individual]) marriageTimestamp = db[person.fg[i][1]].marriages[individual].timestamp
            else {
                console.log('Couldnt find partner marriage.')
                //console.log('Was looking for ', individual)
                //console.log('Was looking for ', db[person.fg[i][1]])
                //console.log('Was looking for ', db[person.fg[i][1]].marriages)
                //console.log('Was looking for ', db[person.fg[i][1]].marriages[individual])
                }
            
            records.push(marriageTimestamp+'\t'+person.fg[i][1]+'\tspouse\tmarriage')
            //records.push(person.fg[i][0]+'\t'+person.fg[i][1]+'\tspouse\tmarriage')
			}
		}

	// get spouse death
	if (person.fg) {
		for (i=0;i<person.fg.length;i++) {
			var spouse = person.fg[i][1]
			if (db[spouse] && db[spouse].d) {
				if (db[spouse].male) type = 'husband'
				else type = 'wife'
				records.push(getTimestamp(db[spouse].ddate, db[spouse].d)+'\t'+spouse+'\t'+type+'\tdies')
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
					if (db[child].b) records.push(getTimestamp(db[child].bdate, db[child].b)+'\t'+child+'\t'+type+'\tborn')
					if (db[child].d) records.push(getTimestamp(db[child].ddate, db[child].d)+'\t'+child+'\t'+type+'\tdies')
					}
				}
			}
		}

	// get parents death
	if (db[person.father]) { 
        if (db[person.father].d) {
			records.push(getTimestamp(db[person.father].ddate, db[person.father].d)+'\t'+person.father+'\tfather\tdies')
			}
		}
	if (db[person.mother]) { 
		if (db[person.mother].d) {
			records.push(getTimestamp(db[person.mother].ddate, db[person.mother].d)+'\t'+person.mother+'\tmother\tdies')
			}
		}


	// get grandparents death
	var gparent
	if (db[person.father]) { 
		if (db[person.father].father && db[db[person.father].father] && db[db[person.father].father].d) {
            records.push(getTimestamp(db[db[person.father].father].ddate, db[db[person.father].father].d)+'\t'+db[person.father].father+'\tgrandfather\tdies')
			}
		if (db[person.father].mother && db[db[person.father].mother] && db[db[person.father].mother].d) {
            records.push(getTimestamp(db[db[person.father].mother].ddate, db[db[person.father].mother].d)+'\t'+db[person.father].mother+'\tgrandmother\tdies')
			}
		}
	if (db[person.mother]) { 
		if (db[person.mother].father && db[db[person.mother].father] && db[db[person.mother].father].d) {
            records.push(getTimestamp(db[db[person.mother].father].ddate, db[db[person.mother].father].d)+'\t'+db[person.mother].father+'\tgrandfather\tdies')
			}
		if (db[person.mother].mother && db[db[person.mother].mother] && db[db[person.mother].mother].d) {
            records.push(getTimestamp(db[db[person.mother].mother].ddate, db[db[person.mother].mother].d)+'\t'+db[person.mother].mother+'\tgrandmother\tdies')
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
							 records.push(db[child].fg[k][0]+'\t'+child+'^'+db[child].fg[k][1]+'\t'+type+'\tmarriage')
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






/*
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
*/

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

    document.getElementById('in').textContent = relative.timeline
    counter--
	}


function init () {
	// make a list of related people who have json data
	// console.log(enter,'init()')
    
	//var relatives = findRelatives(thisPerson)
	//relatives.push(thisPerson)
	if (debug) console.log('Init: thisPerson is ',thisPerson)
	//if (debug) console.log('Init: relatives is ',relatives)
	
	// read in the json data for relatives
	//for (var r=0;r<relatives.length;r++) getRelatives(relatives[r])
    
    // add the timeline sequence to a hidden div
    document.getElementById('in').textContent = db[thisPerson].timeline
    
    setUpPage(thisPerson)
    
    // console.log(exit, 'init')
    }



function setUpPageX (thisPerson) {
    // console.log(enter,'setUpPage('+thisPerson+')')

    // set tagged flags from localstorage
    if (localStorage.ancestryflags) {
        flagList = localStorage.ancestryflags.split('\n')
        for (i=0;i<flagList.length;i++) if (db[flagList[i]]) db[flagList[i]].tagged = true 
        }
    
	checkBMD(thisPerson)
	document.getElementById('out').innerHTML = redisplay(document.getElementById('in').textContent,thisPerson,document.getElementById('summaryIn'))

	var dob = thisPerson.split('_')
	if (localStorage.ancestryHideRelatives === 'yes') toggleRelatives(document.getElementById('toggleRelatives'))
	if (localStorage.ancestryHideHistory === 'no') toggleHistory(document.getElementById('toggleEvents'), dob[dob.length-1])
	if (localStorage.ancestryExpandDetail === 'yes') toggleDetails(document.getElementById('toggleDetails'))
	//if (localStorage.ancestryMinimise === 'yes') toggleMinimal(document.getElementById('minimiseToggle'))
	
    if (trace) console.log(exit, 'setUpPage')
	}



function setUpPage (thisPerson) {
    // console.log(enter,'setUpPage('+thisPerson+')')

    // set tagged flags from localstorage
    projectFlags= project+'flags'
    if (localStorage[projectFlags]) {
        flagList = localStorage[projectFlags].split('\n')
        for (i=0;i<flagList.length;i++) if (db[flagList[i]]) db[flagList[i]].tagged = true 
        }
    
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
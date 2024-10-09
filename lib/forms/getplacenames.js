

function findallplaces () {
    // makes a list of all 'place' fields in BMDC

    // global placenames{}, a list of all placenames    
    var name, line
    
    window.placenames = {}
    
    for (name in db) {
        if (db[name].birth && db[name].birth.place) placenames[db[name].birth.place] = true
        if (db[name].birth && db[name].birth.bapplace) placenames[db[name].birth.bapplace] = true        
        if (db[name].birth && db[name].birth.gps) for (i=0;i<db[name].birth.gps.length;i++) placenames[db[name].birth.gps[i]] = true
        
        
        if (db[name].marriages) {
            for (mRec in db[name].marriages) {
                if (db[name].marriages[mRec].place) placenames[db[name].marriages[mRec].place] = true
                if (db[name].marriages[mRec].gparish) placenames[db[name].marriages[mRec].gparish] = true 
                if (db[name].marriages[mRec].bparish) placenames[db[name].marriages[mRec].bparish] = true
                if (db[name].marriages[mRec].gps) for (i=0;i<db[name].marriages[mRec].gps.length;i++) placenames[db[name].marriages[mRec].gps[i]] = true
                }
            }


        if (db[name].death && db[name].death.place) placenames[db[name].death.place] = true
        if (db[name].death && db[name].death.of) placenames[db[name].death.of] = true
        if (db[name].death && db[name].death.gps) for (i=0;i<db[name].death.gps.length;i++) placenames[db[name].death.gps[i]] = true
         
        
        if (db[name].events) {
            for (eRec in db[name].events) {
                if (db[name].events[eRec].place) placenames[db[name].events[eRec].place] = true
                if (db[name].events[eRec].gps) for (i=0;i<db[name].events[eRec].gps.length;i++)  placenames[db[name].events[eRec].gps[i]] = true
                }
            }
        }
   
    for (name in censi) {
        if (censi[name].place) placenames[censi[name].place] = true
        if (censi[name].gps) placenames[censi[name].gps] = true
        }
    
	console.log('PLACENAME DB SIZE:', Object.keys(placenames).length)
	}








function makePlacesDatalist (person) {
    // populate the places datalist
    out = ''

	Object.keys(placenames).sort().forEach(key => {
        out += `<option value="${ key }">${ key }</option>\n`
		});

    document.getElementById('gpsList').innerHTML = out
	}


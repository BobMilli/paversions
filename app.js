const express = require('express')
const cors = require('cors')
// https://stackoverflow.com/questions/52225461/puppeteer-unable-to-run-on-heroku
const puppeteer = require('puppeteer')

const app = express()
const port = process.env.PORT || 3000

const paproducts = ['PAW', 'PAX', 'TM1','TM1Web']

// source : https://expressjs.com/en/resources/middleware/cors.html
app.use(cors())
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    next()
  })

// source : https://expressjs.com/fr/starter/static-files.html
app.use('/', express.static(__dirname + '/public'));

// As bodyparser is deprecated we can get rid of it 
// source : https://stackoverflow.com/questions/66548302/body-parser-deprecated
app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.get('/check', (req, res) => {
    const now = new Date().toLocaleString();
    res.status(200).json({"timestamp":now, "message":'Hello World!'})
    res.end()
  })

function stringDateToDate(stringDate) {
  // Convert to uppercase to ease the job
  stringDate = stringDate.toUpperCase();
  // Split the string date using regEx
  let dateParts = stringDate.match(/(^\S*)\s(\d*),\s(\d*)/);
  let sTextMonthPart  = dateParts[1];
  let sDayPart  = dateParts[2];
  let sYearPart  = dateParts[3];
  // Convert string Month to number
  monthsarray = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER"
  ];
  let sMonthPart =  (101 + monthsarray.indexOf(sTextMonthPart)).toString().substring(1,3);
  // return a real Date 
  return new Date(sYearPart + '-' + sMonthPart + '-' + sDayPart)
}

  async function GetPAVersions (paproduct) {
    const browser = await puppeteer.launch({
      'args' : [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ],
      headless: true
    })
    const page = await browser.newPage()
    let paurl = ''
    switch (paproduct) {
      case 'PAW':
        paurl = 'https://www.ibm.com/support/knowledgecenter/SSD29G_2.0.0/com.ibm.swg.ba.cognos.tm1_nfg.2.0.0.doc/c_new_features_paw.html?view=embed'
        break
      case 'PAX':
        paurl = 'https://www.ibm.com/support/knowledgecenter/SSD29G_2.0.0/com.ibm.swg.ba.cognos.tm1_nfg.2.0.0.doc/c_nfg_pax_test.html?view=embed'
        break
      case 'TM1':
        paurl = 'https://www.ibm.com/support/knowledgecenter/SSD29G_2.0.0/com.ibm.swg.ba.cognos.tm1_nfg.2.0.0.doc/c_pa_nfg_introduction.html?view=embed'
        break
      case 'TM1Web':
        paurl = 'https://www.ibm.com/support/knowledgecenter/SSD29G_2.0.0/com.ibm.swg.ba.cognos.tm1_nfg.2.0.0.doc/c_nfg_tm1_web.html?view=embed'
        break
    }
    await page.goto(paurl, {
      waitUntil: 'networkidle2'
    })
    const result = await page.evaluate(() => {
      const paversions = document.getElementsByClassName('ulchildlink')
      return Array.from(paversions).map(paversion => {
        return paversion.innerHTML
      })
    })
    await browser.close()
    let extract
    return Array.from(result).map(paversionhtml => {
      switch (paproduct) {
        case 'PAW':
          extract = paversionhtml.match(
            /">((\d|\.|, )+)(.*new,\s*([^<]+))?/
          )
          break
        case 'PAX':
          extract = paversionhtml.match(
            /">((\d|\.|, )+)(.*[updates|known issues],\s*([^<]+))?/
          )
          break
        case 'TM1Web':
          extract = paversionhtml.match(
            /">((\d|\.|, )+)(.*[updates|known issues],\s*([^<]+))?/
          )
          break
        case 'TM1':
          extract = paversionhtml.match(
            /Analytics\s((\d|\.|, )+)(.*-\s*([^<]+))?/
          )
          break
      }
      let paversionnumber = ''
      let paversiondate = ''
      try {
        if (extract !== undefined) {
          paversionnumber = extract[1]
          paversiondate = stringDateToDate(extract[4])
        }
      } catch (error) {}
      return {
        PAProduct: paproduct,
        PAVersionNumber: paversionnumber,
        PAVersionDate: paversiondate
      }
    })
  }

  app.get('/paversions', (req, res, next) => {
    var promises = []
    var paversions = []
  
    paproducts.forEach(paproduct => {
      promises.push(GetPAVersions(paproduct))
    })
    Promise.all(promises)
      .then(data => {
        data.forEach(paproduct => {
          paproduct.forEach(paproductversion => {
            paversions.push(paproductversion)
          })
        })
        res.status(200).json(paversions)
        res.end()
      })
      .catch(e => {
        console.log('An error occurs : ')
        console.log(e)
      })
  })

  app.get('/paversionsTM1', (req, res, next) => {
    var promises = []
    var paversions = []
  
    promises.push(GetPAVersions('TM1'))

    Promise.all(promises)
      .then(data => {
        data.forEach(paproduct => {
          paproduct.forEach(paproductversion => {
            paversions.push(paproductversion)
          })
        })
        res.status(200).json(paversions)
        res.end()
      })
      .catch(e => {
        console.log('An error occurs : ')
        console.log(e)
      })
  })

  // const paproducts = ['PAX', 'TM1Web']

  app.get('/paversionsPAW', (req, res, next) => {
    var promises = []
    var paversions = []
  
    promises.push(GetPAVersions('PAW'))

    Promise.all(promises)
      .then(data => {
        data.forEach(paproduct => {
          paproduct.forEach(paproductversion => {
            paversions.push(paproductversion)
          })
        })
        res.status(200).json(paversions)
        res.end()
      })
      .catch(e => {
        console.log('An error occurs : ')
        console.log(e)
      })
  })
  
  // const paproducts = [ 'TM1Web']

  app.get('/paversionsPAX', (req, res, next) => {
    var promises = []
    var paversions = []
  
    promises.push(GetPAVersions('PAX'))

    Promise.all(promises)
      .then(data => {
        data.forEach(paproduct => {
          paproduct.forEach(paproductversion => {
            paversions.push(paproductversion)
          })
        })
        res.status(200).json(paversions)
        res.end()
      })
      .catch(e => {
        console.log('An error occurs : ')
        console.log(e)
      })
  })

  app.get('/paversionsTM1Web', (req, res, next) => {
    var promises = []
    var paversions = []
  
    promises.push(GetPAVersions('TM1Web'))

    Promise.all(promises)
      .then(data => {
        data.forEach(paproduct => {
          paproduct.forEach(paproductversion => {
            paversions.push(paproductversion)
          })
        })
        res.status(200).json(paversions)
        res.end()
      })
      .catch(e => {
        console.log('An error occurs : ')
        console.log(e)
      })
  })

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
  
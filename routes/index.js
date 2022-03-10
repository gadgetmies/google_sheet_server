const bodyParser = require('body-parser')
const router = require('express-promise-router')()
router.use(bodyParser.json())
const {google} = require('googleapis')

const auth = new google.auth.GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})
const sheets = google.sheets({version: 'v4', auth})

const getSheet = async (spreadsheetId) => {
  const sheetDetails = await new Promise((resolve, reject) =>
    sheets.spreadsheets.get(
      {
        spreadsheetId,
      },
      (err, res) => {
        if (err) {
          return reject(err)
        }
        return resolve({
          title: res.data.properties.title,
          sheetTitles: res.data.sheets.map(({properties: {title}}) => title)
        })
      }
    )
  )

  let sheetValues = []
  for (const title of sheetDetails.sheetTitles) {
    const sheet = await new Promise((resolve, reject) =>
      sheets.spreadsheets.values.get(
        {
          spreadsheetId,
          range: `${title}`
        },
        (err, res) => {
          if (err) {
            return reject(err)
          }
          return resolve({
            title,
            values: res.data.values
          })
        }
      )
    )

    sheetValues.push(sheet)
  }

  return {title: sheetDetails.title, sheets: sheetValues}
}

router.get('/:sheetId', async ({params: {sheetId}}, res) => {
  const sheet = await getSheet(sheetId)
  res.send(sheet)
})

module.exports = router


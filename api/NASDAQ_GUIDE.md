# Guia de uso dos endpoints públicos NASDAQ

> Vamos utilizar o symbol AAPL como exemplo (Apple). Mas substitua pelo symbol desejado.

### Perfil da Empresa
https://api.nasdaq.com/api/company/AAPL/company-profile

Resposta:
```json
{
  "data": {
    "ModuleTitle": {
      "label": "Module Title",
      "value": "Company Description"
    },
    "CompanyName": {
      "label": "Company Name",
      "value": "Apple Inc."
    },
    "Symbol": {
      "label": "Symbol",
      "value": "AAPL"
    },
    "Address": {
      "label": "Address",
      "value": "ONE APPLE PARK WAY, CUPERTINO, California, 95014, United States"
    },
    "Phone": {
      "label": "Phone",
      "value": "+1 408 - 996-1010"
    },
    "Industry": {
      "label": "Industry",
      "value": "Computer Manufacturing"
    },
    "Sector": {
      "label": "Sector",
      "value": "Technology"
    },
    "Region": {
      "label": "Region",
      "value": "North America"
    },
    "CompanyDescription": {
      "label": "Company Description",
      "value": "Apple revolutionized personal technology with the introduction of the Macintosh in 1984. Today, Apple leads the world in innovation with iPhone, iPad, Mac, AirPods, Apple Watch, and Apple Vision Pro. Apple's six software platforms - iOS, iPadOS, macOS, watchOS, visionOS, and tvOS - provide seamless experiences across all Apple devices and empower people with breakthrough services including the App Store, Apple Music, Apple Pay, iCloud, and Apple TV. Apple's more than 150,000 employees are dedicated to making the best products on earth and to leaving the world better than we found it."
    },
    "CompanyUrl": {
      "label": "Company Url",
      "value": "https://www.apple.com"
    }
  },
  "message": null,
  "status": {
    "rCode": 200,
    "bCodeMessage": null,
    "developerMessage": null
  }
}
```

### Informações gerais (Dados de Vitrine)
https://api.nasdaq.com/api/quote/AAPL/info?assetclass=stocks

Resposta:
```json
{
  "data": {
    "symbol": "AAPL",
    "companyName": "Apple Inc. Common Stock",
    "stockType": "Common Stock",
    "exchange": "NASDAQ-GS",
    "isNasdaqListed": true,
    "isNasdaq100": true,
    "isHeld": false,
    "primaryData": {
      "lastSalePrice": "$269.48",
      "netChange": "-0.53",
      "percentageChange": "-0.20%",
      "deltaIndicator": "down",
      "lastTradeTimestamp": "Feb 3, 2026",
      "isRealTime": false,
      "bidPrice": "N/A",
      "askPrice": "N/A",
      "bidSize": "N/A",
      "askSize": "N/A",
      "volume": "64,394,655",
      "currency": null
    },
    "secondaryData": null,
    "marketStatus": "Closed",
    "assetClass": "STOCKS",
    "keyStats": {
      "fiftyTwoWeekHighLow": {
        "label": "52 Week Range:",
        "value": "169.21 - 288.62"
      },
      "dayrange": {
        "label": "High/Low:",
        "value": "NA"
      }
    },
    "notifications": [
      {
        "headline": "UPCOMING EVENTS",
        "eventTypes": [
          {
            "message": "Ex-Dividend Date : Feb 9, 2026",
            "eventName": "Dividend Date",
            "url": {
              "label": "AAPL Ex-Dividend Date : Feb 9, 2026",
              "value": "/market-activity/stocks/AAPL/dividend-history"
            },
            "id": "upcoming_events"
          }
        ]
      },
      {
        "headline": "HIGH TECHNICAL ATTRIBUTE",
        "eventTypes": [
          {
            "message": "AAPL has a High Technical Rating by Nasdaq Dorsey Wright. Discover why technical analysis matters",
            "eventName": "High Technical Attribute",
            "url": {
              "label": "Discover why technical analysis matters",
              "value": "https://www.nasdaq.com/solutions/nasdaq-dorsey-wright/technical-analysis"
            },
            "id": "tech_attribute"
          }
        ]
      }
    ]
  },
  "message": null,
  "status": {
    "rCode": 200,
    "bCodeMessage": null,
    "developerMessage": null
  }
}
```

### Informações Gerais (resumo geral)
https://api.nasdaq.com/api/quote/AAPL/summary?assetclass=stocks

```json
{
  "data": {
    "symbol": "AAPL",
    "summaryData": {
      "Exchange": {
        "label": "Exchange",
        "value": "NASDAQ-GS"
      },
      "Sector": {
        "label": "Sector",
        "value": "Technology"
      },
      "Industry": {
        "label": "Industry",
        "value": "Computer Manufacturing"
      },
      "OneYrTarget": {
        "label": "1 Year Target",
        "value": "$300.00"
      },
      "TodayHighLow": {
        "label": "Today's High/Low",
        "value": "N/A"
      },
      "ShareVolume": {
        "label": "Share Volume",
        "value": "64,394,655"
      },
      "AverageVolume": {
        "label": "Average Volume",
        "value": "46,298,846"
      },
      "PreviousClose": {
        "label": "Previous Close",
        "value": "$270.01"
      },
      "FiftTwoWeekHighLow": {
        "label": "52 Week High/Low",
        "value": "$288.62/$169.2101"
      },
      "MarketCap": {
        "label": "Market Cap",
        "value": "3,956,273,607,200"
      },
      "AnnualizedDividend": {
        "label": "Annualized Dividend",
        "value": "$1.04"
      },
      "ExDividendDate": {
        "label": "Ex Dividend Date",
        "value": "Nov 10, 2025"
      },
      "DividendPaymentDate": {
        "label": "Dividend Pay Date",
        "value": "Nov 13, 2025"
      },
      "Yield": {
        "label": "Current Yield",
        "value": "0.39%"
      }
    },
    "assetClass": "STOCKS",
    "additionalData": null,
    "bidAsk": {
      "Bid * Size": {
        "label": "Bid * Size",
        "value": "N/A"
      },
      "Ask * Size": {
        "label": "Ask * Size",
        "value": "N/A"
      }
    }
  },
  "message": null,
  "status": {
    "rCode": 200,
    "bCodeMessage": null,
    "developerMessage": null
  }
}
```

### Pagamento de Dividendos
https://api.nasdaq.com/api/quote/AAPL/dividends?assetclass=stocks

Resposta:
```json
{
  "data": {
    "dividendHeaderValues": [
      {
        "label": "Ex-Dividend Date",
        "value": "11/10/2025"
      },
      {
        "label": "Dividend Yield",
        "value": "0.39%"
      },
      {
        "label": "Annual Dividend",
        "value": "$1.04"
      },
      {
        "label": "P/E Ratio",
        "value": "44.03"
      }
    ],
    "exDividendDate": "11/10/2025",
    "dividendPaymentDate": "11/13/2025",
    "yield": "0.39%",
    "annualizedDividend": "1.04",
    "payoutRatio": "44.03",
    "dividends": {
      "asOf": null,
      "headers": {
        "exOrEffDate": "Ex/EFF Date",
        "type": "Type",
        "amount": "Cash Amount",
        "declarationDate": "Declaration Date",
        "recordDate": "Record Date",
        "paymentDate": "Payment Date"
      },
      "rows": [
        {
          "exOrEffDate": "02/09/2026",
          "type": "Cash",
          "amount": "$0.26",
          "declarationDate": "01/29/2026",
          "recordDate": "02/09/2026",
          "paymentDate": "02/12/2026",
          "currency": "USD"
        },
        {
          "exOrEffDate": "11/10/2025",
          "type": "Cash",
          "amount": "$0.26",
          "declarationDate": "10/30/2025",
          "recordDate": "11/10/2025",
          "paymentDate": "11/13/2025",
          "currency": "USD"
        },
        {
          "exOrEffDate": "08/11/2025",
          "type": "Cash",
          "amount": "$0.26",
          "declarationDate": "07/31/2025",
          "recordDate": "08/11/2025",
          "paymentDate": "08/14/2025",
          "currency": "USD"
        },
        {
          "exOrEffDate": "05/12/2025",
          "type": "Cash",
          "amount": "$0.26",
          "declarationDate": "05/01/2025",
          "recordDate": "05/12/2025",
          "paymentDate": "05/15/2025",
          "currency": "USD"
        },
        {
          "exOrEffDate": "02/10/2025",
          "type": "Cash",
          "amount": "$0.25",
          "declarationDate": "01/30/2025",
          "recordDate": "02/10/2025",
          "paymentDate": "02/13/2025",
          "currency": "USD"
        },
        {
          "exOrEffDate": "11/08/2024",
          "type": "Cash",
          "amount": "$0.25",
          "declarationDate": "10/31/2024",
          "recordDate": "11/11/2024",
          "paymentDate": "11/14/2024",
          "currency": "USD"
        },
        {
          "exOrEffDate": "08/12/2024",
          "type": "Cash",
          "amount": "$0.25",
          "declarationDate": "08/01/2024",
          "recordDate": "08/12/2024",
          "paymentDate": "08/15/2024",
          "currency": "USD"
        },
        {
          "exOrEffDate": "05/10/2024",
          "type": "Cash",
          "amount": "$0.25",
          "declarationDate": "05/02/2024",
          "recordDate": "05/13/2024",
          "paymentDate": "05/16/2024",
          "currency": "USD"
        },
        {
          "exOrEffDate": "02/09/2024",
          "type": "Cash",
          "amount": "$0.24",
          "declarationDate": "02/01/2024",
          "recordDate": "02/12/2024",
          "paymentDate": "02/15/2024",
          "currency": "USD"
        },
        {
          "exOrEffDate": "11/10/2023",
          "type": "Cash",
          "amount": "$0.24",
          "declarationDate": "11/02/2023",
          "recordDate": "11/13/2023",
          "paymentDate": "11/16/2023",
          "currency": "USD"
        },
        {
          "exOrEffDate": "08/11/2023",
          "type": "Cash",
          "amount": "$0.24",
          "declarationDate": "08/03/2023",
          "recordDate": "08/14/2023",
          "paymentDate": "08/17/2023",
          "currency": "USD"
        },
        {
          "exOrEffDate": "05/12/2023",
          "type": "Cash",
          "amount": "$0.24",
          "declarationDate": "05/04/2023",
          "recordDate": "05/15/2023",
          "paymentDate": "05/18/2023",
          "currency": "USD"
        },
        {
          "exOrEffDate": "02/10/2023",
          "type": "Cash",
          "amount": "$0.23",
          "declarationDate": "02/02/2023",
          "recordDate": "02/13/2023",
          "paymentDate": "02/16/2023",
          "currency": "USD"
        },
        {
          "exOrEffDate": "11/04/2022",
          "type": "Cash",
          "amount": "$0.23",
          "declarationDate": "10/27/2022",
          "recordDate": "11/07/2022",
          "paymentDate": "11/10/2022",
          "currency": "USD"
        },
        {
          "exOrEffDate": "08/05/2022",
          "type": "Cash",
          "amount": "$0.23",
          "declarationDate": "07/28/2022",
          "recordDate": "08/08/2022",
          "paymentDate": "08/11/2022",
          "currency": "USD"
        },
        {
          "exOrEffDate": "05/06/2022",
          "type": "Cash",
          "amount": "$0.23",
          "declarationDate": "04/28/2022",
          "recordDate": "05/09/2022",
          "paymentDate": "05/12/2022",
          "currency": "USD"
        },
        {
          "exOrEffDate": "02/04/2022",
          "type": "Cash",
          "amount": "$0.22",
          "declarationDate": "01/27/2022",
          "recordDate": "02/07/2022",
          "paymentDate": "02/10/2022",
          "currency": "USD"
        },
        {
          "exOrEffDate": "11/05/2021",
          "type": "Cash",
          "amount": "$0.22",
          "declarationDate": "10/28/2021",
          "recordDate": "11/08/2021",
          "paymentDate": "11/11/2021",
          "currency": "USD"
        },
        {
          "exOrEffDate": "08/06/2021",
          "type": "Cash",
          "amount": "$0.22",
          "declarationDate": "07/27/2021",
          "recordDate": "08/09/2021",
          "paymentDate": "08/12/2021",
          "currency": "USD"
        },
        {
          "exOrEffDate": "05/07/2021",
          "type": "Cash",
          "amount": "$0.22",
          "declarationDate": "04/28/2021",
          "recordDate": "05/10/2021",
          "paymentDate": "05/13/2021",
          "currency": "USD"
        },
        {
          "exOrEffDate": "02/05/2021",
          "type": "Cash",
          "amount": "$0.205",
          "declarationDate": "01/27/2021",
          "recordDate": "02/08/2021",
          "paymentDate": "02/11/2021",
          "currency": "USD"
        },
        {
          "exOrEffDate": "11/06/2020",
          "type": "Cash",
          "amount": "$0.205",
          "declarationDate": "10/29/2020",
          "recordDate": "11/09/2020",
          "paymentDate": "11/12/2020",
          "currency": "USD"
        },
        {
          "exOrEffDate": "08/07/2020",
          "type": "Cash",
          "amount": "$0.82",
          "declarationDate": "07/30/2020",
          "recordDate": "08/10/2020",
          "paymentDate": "08/13/2020",
          "currency": "USD"
        },
        {
          "exOrEffDate": "05/08/2020",
          "type": "Cash",
          "amount": "$0.82",
          "declarationDate": "04/30/2020",
          "recordDate": "05/11/2020",
          "paymentDate": "05/14/2020",
          "currency": "USD"
        },
        {
          "exOrEffDate": "02/07/2020",
          "type": "Cash",
          "amount": "$0.77",
          "declarationDate": "01/28/2020",
          "recordDate": "02/10/2020",
          "paymentDate": "02/13/2020",
          "currency": "USD"
        },
        {
          "exOrEffDate": "11/07/2019",
          "type": "Cash",
          "amount": "$0.77",
          "declarationDate": "10/30/2019",
          "recordDate": "11/11/2019",
          "paymentDate": "11/14/2019",
          "currency": "USD"
        },
        {
          "exOrEffDate": "08/09/2019",
          "type": "Cash",
          "amount": "$0.77",
          "declarationDate": "07/30/2019",
          "recordDate": "08/12/2019",
          "paymentDate": "08/15/2019",
          "currency": "USD"
        },
        {
          "exOrEffDate": "05/10/2019",
          "type": "Cash",
          "amount": "$0.77",
          "declarationDate": "04/30/2019",
          "recordDate": "05/13/2019",
          "paymentDate": "05/16/2019",
          "currency": "USD"
        },
        {
          "exOrEffDate": "02/08/2019",
          "type": "Cash",
          "amount": "$0.73",
          "declarationDate": "01/29/2019",
          "recordDate": "02/11/2019",
          "paymentDate": "02/14/2019",
          "currency": "USD"
        },
        {
          "exOrEffDate": "11/08/2018",
          "type": "Cash",
          "amount": "$0.73",
          "declarationDate": "11/01/2018",
          "recordDate": "11/12/2018",
          "paymentDate": "11/15/2018",
          "currency": "USD"
        },
        {
          "exOrEffDate": "08/10/2018",
          "type": "Cash",
          "amount": "$0.73",
          "declarationDate": "07/31/2018",
          "recordDate": "08/13/2018",
          "paymentDate": "08/16/2018",
          "currency": "USD"
        },
        {
          "exOrEffDate": "05/11/2018",
          "type": "Cash",
          "amount": "$0.73",
          "declarationDate": "05/01/2018",
          "recordDate": "05/14/2018",
          "paymentDate": "05/17/2018",
          "currency": "USD"
        },
        {
          "exOrEffDate": "02/09/2018",
          "type": "Cash",
          "amount": "$0.63",
          "declarationDate": "02/01/2018",
          "recordDate": "02/12/2018",
          "paymentDate": "02/15/2018",
          "currency": "USD"
        },
        {
          "exOrEffDate": "11/10/2017",
          "type": "Cash",
          "amount": "$0.63",
          "declarationDate": "11/02/2017",
          "recordDate": "11/13/2017",
          "paymentDate": "11/16/2017",
          "currency": "USD"
        },
        {
          "exOrEffDate": "08/10/2017",
          "type": "Cash",
          "amount": "$0.63",
          "declarationDate": "08/01/2017",
          "recordDate": "08/14/2017",
          "paymentDate": "08/17/2017",
          "currency": "USD"
        },
        {
          "exOrEffDate": "05/11/2017",
          "type": "Cash",
          "amount": "$0.63",
          "declarationDate": "05/02/2017",
          "recordDate": "05/15/2017",
          "paymentDate": "05/18/2017",
          "currency": "USD"
        },
        {
          "exOrEffDate": "02/09/2017",
          "type": "Cash",
          "amount": "$0.57",
          "declarationDate": "01/31/2017",
          "recordDate": "02/13/2017",
          "paymentDate": "02/16/2017",
          "currency": "USD"
        },
        {
          "exOrEffDate": "11/03/2016",
          "type": "Cash",
          "amount": "$0.57",
          "declarationDate": "10/25/2016",
          "recordDate": "11/07/2016",
          "paymentDate": "11/10/2016",
          "currency": "USD"
        },
        {
          "exOrEffDate": "08/04/2016",
          "type": "Cash",
          "amount": "$0.57",
          "declarationDate": "07/26/2016",
          "recordDate": "08/08/2016",
          "paymentDate": "08/11/2016",
          "currency": "USD"
        },
        {
          "exOrEffDate": "05/05/2016",
          "type": "Cash",
          "amount": "$0.57",
          "declarationDate": "04/26/2016",
          "recordDate": "05/09/2016",
          "paymentDate": "05/12/2016",
          "currency": "USD"
        },
        {
          "exOrEffDate": "02/04/2016",
          "type": "Cash",
          "amount": "$0.52",
          "declarationDate": "01/26/2016",
          "recordDate": "02/08/2016",
          "paymentDate": "02/11/2016",
          "currency": "USD"
        },
        {
          "exOrEffDate": "11/05/2015",
          "type": "Cash",
          "amount": "$0.52",
          "declarationDate": "10/27/2015",
          "recordDate": "11/09/2015",
          "paymentDate": "11/12/2015",
          "currency": "USD"
        },
        {
          "exOrEffDate": "08/06/2015",
          "type": "Cash",
          "amount": "$0.52",
          "declarationDate": "07/21/2015",
          "recordDate": "08/10/2015",
          "paymentDate": "08/13/2015",
          "currency": "USD"
        },
        {
          "exOrEffDate": "05/07/2015",
          "type": "Cash",
          "amount": "$0.52",
          "declarationDate": "04/27/2015",
          "recordDate": "05/11/2015",
          "paymentDate": "05/14/2015",
          "currency": "USD"
        },
        {
          "exOrEffDate": "02/05/2015",
          "type": "Cash",
          "amount": "$0.47",
          "declarationDate": "01/27/2015",
          "recordDate": "02/09/2015",
          "paymentDate": "02/12/2015",
          "currency": "USD"
        },
        {
          "exOrEffDate": "11/06/2014",
          "type": "Cash",
          "amount": "$0.47",
          "declarationDate": "10/20/2014",
          "recordDate": "11/10/2014",
          "paymentDate": "11/13/2014",
          "currency": "USD"
        },
        {
          "exOrEffDate": "08/07/2014",
          "type": "Cash",
          "amount": "$0.47",
          "declarationDate": "07/22/2014",
          "recordDate": "08/11/2014",
          "paymentDate": "08/14/2014",
          "currency": "USD"
        },
        {
          "exOrEffDate": "05/08/2014",
          "type": "Cash",
          "amount": "$3.29",
          "declarationDate": "04/23/2014",
          "recordDate": "05/12/2014",
          "paymentDate": "05/15/2014",
          "currency": "USD"
        },
        {
          "exOrEffDate": "02/06/2014",
          "type": "Cash",
          "amount": "$3.05",
          "declarationDate": "01/27/2014",
          "recordDate": "02/10/2014",
          "paymentDate": "02/13/2014",
          "currency": "USD"
        },
        {
          "exOrEffDate": "11/06/2013",
          "type": "Cash",
          "amount": "$3.05",
          "declarationDate": "10/28/2013",
          "recordDate": "11/11/2013",
          "paymentDate": "11/14/2013",
          "currency": "USD"
        },
        {
          "exOrEffDate": "08/08/2013",
          "type": "Cash",
          "amount": "$3.05",
          "declarationDate": "07/23/2013",
          "recordDate": "08/12/2013",
          "paymentDate": "08/15/2013",
          "currency": "USD"
        },
        {
          "exOrEffDate": "02/07/2013",
          "type": "Cash",
          "amount": "$2.65",
          "declarationDate": "01/23/2013",
          "recordDate": "02/11/2013",
          "paymentDate": "02/14/2013",
          "currency": "USD"
        },
        {
          "exOrEffDate": "11/21/1995",
          "type": "Cash",
          "amount": "$0.12",
          "declarationDate": "N/A",
          "recordDate": "11/21/1995",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "08/16/1995",
          "type": "Cash",
          "amount": "$0.12",
          "declarationDate": "N/A",
          "recordDate": "08/16/1995",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "05/26/1995",
          "type": "Cash",
          "amount": "$0.12",
          "declarationDate": "N/A",
          "recordDate": "05/26/1995",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "02/13/1995",
          "type": "Cash",
          "amount": "$0.12",
          "declarationDate": "N/A",
          "recordDate": "02/13/1995",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "11/18/1994",
          "type": "Cash",
          "amount": "$0.12",
          "declarationDate": "N/A",
          "recordDate": "11/18/1994",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "08/15/1994",
          "type": "Cash",
          "amount": "$0.12",
          "declarationDate": "N/A",
          "recordDate": "08/15/1994",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "05/27/1994",
          "type": "Cash",
          "amount": "$0.12",
          "declarationDate": "N/A",
          "recordDate": "05/27/1994",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "02/07/1994",
          "type": "Cash",
          "amount": "$0.12",
          "declarationDate": "N/A",
          "recordDate": "02/07/1994",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "11/19/1993",
          "type": "Cash",
          "amount": "$0.12",
          "declarationDate": "N/A",
          "recordDate": "11/19/1993",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "08/16/1993",
          "type": "Cash",
          "amount": "$0.12",
          "declarationDate": "N/A",
          "recordDate": "08/16/1993",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "05/28/1993",
          "type": "Cash",
          "amount": "$0.12",
          "declarationDate": "N/A",
          "recordDate": "05/28/1993",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "02/12/1993",
          "type": "Cash",
          "amount": "$0.12",
          "declarationDate": "N/A",
          "recordDate": "02/12/1993",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "11/30/1992",
          "type": "Cash",
          "amount": "$0.12",
          "declarationDate": "N/A",
          "recordDate": "11/30/1992",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "08/17/1992",
          "type": "Cash",
          "amount": "$0.12",
          "declarationDate": "N/A",
          "recordDate": "08/17/1992",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "06/01/1992",
          "type": "Cash",
          "amount": "$0.12",
          "declarationDate": "N/A",
          "recordDate": "06/01/1992",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "02/14/1992",
          "type": "Cash",
          "amount": "$0.12",
          "declarationDate": "N/A",
          "recordDate": "02/14/1992",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "11/18/1991",
          "type": "Cash",
          "amount": "$0.12",
          "declarationDate": "N/A",
          "recordDate": "11/18/1991",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "08/19/1991",
          "type": "Cash",
          "amount": "$0.12",
          "declarationDate": "N/A",
          "recordDate": "08/19/1991",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "05/20/1991",
          "type": "Cash",
          "amount": "$0.12",
          "declarationDate": "N/A",
          "recordDate": "05/20/1991",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "02/15/1991",
          "type": "Cash",
          "amount": "$0.12",
          "declarationDate": "N/A",
          "recordDate": "02/15/1991",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "11/16/1990",
          "type": "Cash",
          "amount": "$0.12",
          "declarationDate": "N/A",
          "recordDate": "11/16/1990",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "08/20/1990",
          "type": "Cash",
          "amount": "$0.11",
          "declarationDate": "N/A",
          "recordDate": "08/20/1990",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "05/21/1990",
          "type": "Cash",
          "amount": "$0.11",
          "declarationDate": "N/A",
          "recordDate": "05/21/1990",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "02/16/1990",
          "type": "Cash",
          "amount": "$0.11",
          "declarationDate": "N/A",
          "recordDate": "02/16/1990",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "11/17/1989",
          "type": "Cash",
          "amount": "$0.11",
          "declarationDate": "N/A",
          "recordDate": "11/17/1989",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "08/21/1989",
          "type": "Cash",
          "amount": "$0.10",
          "declarationDate": "N/A",
          "recordDate": "08/21/1989",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "05/22/1989",
          "type": "Cash",
          "amount": "$0.10",
          "declarationDate": "N/A",
          "recordDate": "05/22/1989",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "02/17/1989",
          "type": "Cash",
          "amount": "$0.10",
          "declarationDate": "N/A",
          "recordDate": "02/17/1989",
          "paymentDate": "N/A",
          "currency": "USD"
        },
        {
          "exOrEffDate": "11/21/1988",
          "type": "Cash",
          "amount": "$0.10",
          "declarationDate": "N/A",
          "recordDate": "11/21/1988",
          "paymentDate": "N/A",
          "currency": "USD"
        }
      ]
    }
  },
  "message": null,
  "status": {
    "rCode": 200,
    "bCodeMessage": null,
    "developerMessage": null
  }
}

```


### Histórico Diário (limite de 10 anos)

https://api.nasdaq.com/api/quote/AAPL/historical?assetclass=stocks&fromdate=2026-01-01&limit=20000

```json
{
  "data": {
    "symbol": "AAPL",
    "totalRecords": 22,
    "tradesTable": {
      "asOf": null,
      "headers": {
        "date": "Date",
        "close": "Close/Last",
        "volume": "Volume",
        "open": "Open",
        "high": "High",
        "low": "Low"
      },
      "rows": [
        {
          "date": "02/03/2026",
          "close": "$269.48",
          "volume": "64,394,660",
          "open": "$269.20",
          "high": "$271.875",
          "low": "$267.61"
        },
        {
          "date": "02/02/2026",
          "close": "$270.01",
          "volume": "73,913,430",
          "open": "$260.03",
          "high": "$270.49",
          "low": "$259.205"
        },
        {
          "date": "01/30/2026",
          "close": "$259.48",
          "volume": "92,443,410",
          "open": "$255.165",
          "high": "$261.8999",
          "low": "$252.18"
        },
        {
          "date": "01/29/2026",
          "close": "$258.28",
          "volume": "67,253,010",
          "open": "$258.00",
          "high": "$259.65",
          "low": "$254.41"
        },
        {
          "date": "01/28/2026",
          "close": "$256.44",
          "volume": "41,287,970",
          "open": "$257.65",
          "high": "$258.855",
          "low": "$254.51"
        },
        {
          "date": "01/27/2026",
          "close": "$258.27",
          "volume": "49,648,270",
          "open": "$259.17",
          "high": "$261.95",
          "low": "$258.21"
        },
        {
          "date": "01/26/2026",
          "close": "$255.41",
          "volume": "55,969,230",
          "open": "$251.48",
          "high": "$256.56",
          "low": "$249.80"
        },
        {
          "date": "01/23/2026",
          "close": "$248.04",
          "volume": "41,688,980",
          "open": "$247.32",
          "high": "$249.41",
          "low": "$244.68"
        },
        {
          "date": "01/22/2026",
          "close": "$248.35",
          "volume": "39,708,340",
          "open": "$249.20",
          "high": "$251.00",
          "low": "$248.15"
        },
        {
          "date": "01/21/2026",
          "close": "$247.65",
          "volume": "54,641,730",
          "open": "$248.70",
          "high": "$251.56",
          "low": "$245.18"
        },
        {
          "date": "01/20/2026",
          "close": "$246.70",
          "volume": "80,267,520",
          "open": "$252.73",
          "high": "$254.79",
          "low": "$243.42"
        },
        {
          "date": "01/16/2026",
          "close": "$255.53",
          "volume": "72,142,770",
          "open": "$257.90",
          "high": "$258.90",
          "low": "$254.93"
        },
        {
          "date": "01/15/2026",
          "close": "$258.21",
          "volume": "39,388,560",
          "open": "$260.65",
          "high": "$261.04",
          "low": "$257.05"
        },
        {
          "date": "01/14/2026",
          "close": "$259.96",
          "volume": "40,019,420",
          "open": "$259.49",
          "high": "$261.82",
          "low": "$256.71"
        },
        {
          "date": "01/13/2026",
          "close": "$261.05",
          "volume": "45,730,850",
          "open": "$258.72",
          "high": "$261.81",
          "low": "$258.39"
        },
        {
          "date": "01/12/2026",
          "close": "$260.25",
          "volume": "45,263,770",
          "open": "$259.16",
          "high": "$261.30",
          "low": "$256.80"
        },
        {
          "date": "01/09/2026",
          "close": "$259.37",
          "volume": "39,996,970",
          "open": "$259.075",
          "high": "$260.21",
          "low": "$256.22"
        },
        {
          "date": "01/08/2026",
          "close": "$259.04",
          "volume": "50,419,340",
          "open": "$257.02",
          "high": "$259.29",
          "low": "$255.70"
        },
        {
          "date": "01/07/2026",
          "close": "$260.33",
          "volume": "48,309,800",
          "open": "$263.20",
          "high": "$263.68",
          "low": "$259.81"
        },
        {
          "date": "01/06/2026",
          "close": "$262.36",
          "volume": "52,352,090",
          "open": "$267.00",
          "high": "$267.55",
          "low": "$262.12"
        },
        {
          "date": "01/05/2026",
          "close": "$267.26",
          "volume": "45,647,190",
          "open": "$270.64",
          "high": "$271.51",
          "low": "$266.14"
        },
        {
          "date": "01/02/2026",
          "close": "$271.01",
          "volume": "37,838,050",
          "open": "$272.255",
          "high": "$277.84",
          "low": "$269.00"
        }
      ]
    }
  },
  "message": null,
  "status": {
    "rCode": 200,
    "bCodeMessage": null,
    "developerMessage": null
  }
}

```

### Holdings

https://api.nasdaq.com/api/company/AAPL/institutional-holdings?limit=2&tableonly=true

Resposta:
```json
{
  "data": {
    "ownershipSummary": null,
    "activePositions": null,
    "newSoldOutPositions": null,
    "holdingsTransactions": {
      "totalRecords": "5895",
      "institutionalHolders": "5,895 Institutional Holders",
      "sharesHeld": "9,449,058,185 Total Shares Held",
      "table": {
        "asOf": null,
        "headers": {
          "ownerName": "Owner Name",
          "date": "Date",
          "sharesHeld": "Shares Held",
          "sharesChange": "Change (Shares)",
          "sharesChangePCT": "Change (%)",
          "marketValue": "Value (In 1,000s)"
        },
        "rows": [
          {
            "ownerName": "Vanguard Group Inc",
            "date": "12/31/2025",
            "sharesHeld": "1,426,283,914",
            "sharesChange": "26,856,752",
            "sharesChangePCT": "1.919%",
            "marketValue": "$384,354,989",
            "url": "/market-activity/institutional-portfolio/vanguard-group-inc-61322"
          },
          {
            "ownerName": "Blackrock, Inc.",
            "date": "9/30/2025",
            "sharesHeld": "1,146,332,274",
            "sharesChange": "-2,506,716",
            "sharesChangePCT": "-0.218%",
            "marketValue": "$308,913,621",
            "url": "/market-activity/institutional-portfolio/blackrock-inc-1287173"
          }
        ]
      }
    }
  },
  "message": null,
  "status": {
    "rCode": 200,
    "bCodeMessage": null,
    "developerMessage": null
  }
}
```

### Negociações Internas

https://api.nasdaq.com/api/company/AAPL/insider-trades?limit=2

Resposta:
```json
{
  "data": {
    "title": null,
    "numberOfTrades": {
      "asOf": null,
      "headers": {
        "insiderTrade": "Insider Trade",
        "months3": "3 Months",
        "months12": "12 Months"
      },
      "rows": [
        {
          "insiderTrade": "Number of Open Market Buys",
          "months3": "0",
          "months12": "0"
        },
        {
          "insiderTrade": "Number of Sells",
          "months3": "2",
          "months12": "27"
        },
        {
          "insiderTrade": "Total Insider Trades",
          "months3": "2",
          "months12": "27"
        }
      ]
    },
    "numberOfSharesTraded": {
      "asOf": null,
      "headers": {
        "insiderTrade": "Insider Trade",
        "months3": "3 Months",
        "months12": "12 Months"
      },
      "rows": [
        {
          "insiderTrade": "Number of Shares Bought",
          "months3": "0",
          "months12": "0"
        },
        {
          "insiderTrade": "Number of Shares Sold",
          "months3": "7,502",
          "months12": "1,088,170"
        },
        {
          "insiderTrade": "Total Shares Traded",
          "months3": "7,502",
          "months12": "1,088,170"
        },
        {
          "insiderTrade": "Net Activity",
          "months3": "(7,502)",
          "months12": "(1,088,170)"
        }
      ]
    },
    "transactionTable": {
      "totalRecords": "94",
      "table": {
        "asOf": null,
        "headers": {
          "insider": "Insider",
          "relation": "Relation",
          "lastDate": "Last Date",
          "transactionType": "Transaction",
          "ownType": "Owner Type",
          "sharesTraded": "Shares Traded",
          "lastPrice": "Price",
          "sharesHeld": "Shares Held"
        },
        "rows": [
          {
            "insider": "ADAMS KATHERINE L.",
            "relation": "Officer",
            "lastDate": "11/12/2025",
            "transactionType": "Disposition (Non Open Market)",
            "ownType": "Direct",
            "sharesTraded": "3,750",
            "lastPrice": "$0.00",
            "sharesHeld": "175,408",
            "url": "/market-activity/insiders/adams-katherine-l-803988"
          },
          {
            "insider": "KONDO CHRIS",
            "relation": "Officer",
            "lastDate": "11/07/2025",
            "transactionType": "Sell",
            "ownType": "Direct",
            "sharesTraded": "3,752",
            "lastPrice": "$271.23",
            "sharesHeld": "15,098",
            "url": "/market-activity/insiders/kondo-chris-956353"
          }
        ]
      }
    },
    "filerTransactionTable": null
  },
  "message": null,
  "status": {
    "rCode": 200,
    "bCodeMessage": null,
    "developerMessage": null
  }
}
```

### Faturamento e Receitas

https://api.nasdaq.com/api/company/AAPL/revenue

```json
{
  "data": {
    "title": "APPLE INC. REVENUE & EARNINGS PER SHARE (EPS)",
    "revenueTable": {
      "asOf": null,
      "headers": {
        "value1": "Fiscal Quarter:",
        "value2": "2026 (Fiscal Year)",
        "value3": "2025 (Fiscal Year)",
        "value4": "2024 (Fiscal Year)"
      },
      "rows": [
        {
          "value1": "December",
          "value2": "",
          "value3": "",
          "value4": ""
        },
        {
          "value1": "Revenue",
          "value2": "$143,756(m)",
          "value3": "$124,300(m)",
          "value4": "$119,575(m)"
        },
        {
          "value1": "EPS",
          "value2": "$2.84 (12/27/2025)",
          "value3": "$2.40 (12/28/2024)",
          "value4": "$2.18 (12/30/2023)"
        },
        {
          "value1": "Dividends",
          "value2": "$0.26",
          "value3": "$0.25",
          "value4": "$0.24"
        },
        {
          "value1": "September (FYE)",
          "value2": "",
          "value3": "",
          "value4": ""
        },
        {
          "value1": "Revenue",
          "value2": "",
          "value3": "$95,359(m)",
          "value4": "$90,753(m)"
        },
        {
          "value1": "EPS",
          "value2": "",
          "value3": "$1.65 (03/29/2025)",
          "value4": "$1.53 (03/30/2024)"
        },
        {
          "value1": "Dividends",
          "value2": "",
          "value3": "$0.26",
          "value4": "$0.25"
        },
        {
          "value1": "June",
          "value2": "",
          "value3": "",
          "value4": ""
        },
        {
          "value1": "Revenue",
          "value2": "",
          "value3": "$94,036(m)",
          "value4": "$85,777(m)"
        },
        {
          "value1": "EPS",
          "value2": "",
          "value3": "$1.57 (06/28/2025)",
          "value4": "$1.40 (06/29/2024)"
        },
        {
          "value1": "Dividends",
          "value2": "",
          "value3": "$0.26",
          "value4": "$0.25"
        },
        {
          "value1": "March",
          "value2": "",
          "value3": "",
          "value4": ""
        },
        {
          "value1": "Revenue",
          "value2": "",
          "value3": "$102,466(m)",
          "value4": "$94,930(m)"
        },
        {
          "value1": "EPS",
          "value2": "",
          "value3": "$1.84 (09/27/2025)",
          "value4": "$0.97 (09/28/2024)"
        },
        {
          "value1": "Dividends",
          "value2": "",
          "value3": "$0.26",
          "value4": "$0.25"
        },
        {
          "value1": "Totals",
          "value2": "",
          "value3": "",
          "value4": ""
        },
        {
          "value1": "Revenue",
          "value2": "$143,756(m)",
          "value3": "$416,161(m)",
          "value4": "$391,035(m)"
        },
        {
          "value1": "EPS",
          "value2": "$2.84",
          "value3": "$7.46",
          "value4": "$6.08"
        },
        {
          "value1": "Dividends",
          "value2": "$0.26",
          "value3": "$1.03",
          "value4": "$0.99"
        }
      ]
    }
  },
  "message": null,
  "status": {
    "rCode": 200,
    "bCodeMessage": null,
    "developerMessage": null
  }
}
```


### Listar Ativos

https://api.nasdaq.com/api/screener/stocks?limit=5&offset=5

Resposta:
```json
{
  "data": {
    "filters": null,
    "table": {
      "asOf": null,
      "headers": {
        "symbol": "Symbol",
        "name": "Name",
        "lastsale": "Last Sale",
        "netchange": "Net Change",
        "pctchange": "% Change",
        "marketCap": "Market Cap"
      },
      "rows": [
        {
          "symbol": "AMZN",
          "name": "Amazon.com, Inc. Common Stock",
          "lastsale": "$238.62",
          "netchange": "-4.34",
          "pctchange": "-1.786%",
          "marketCap": "2,550,899,344,545",
          "url": "/market-activity/stocks/amzn"
        },
        {
          "symbol": "META",
          "name": "Meta Platforms, Inc. Class A Common Stock",
          "lastsale": "$691.70",
          "netchange": "-14.71",
          "pctchange": "-2.082%",
          "marketCap": "1,749,693,514,449",
          "url": "/market-activity/stocks/meta"
        },
        {
          "symbol": "TSM",
          "name": "Taiwan Semiconductor Manufacturing Company Ltd.",
          "lastsale": "$335.75",
          "netchange": "-5.61",
          "pctchange": "-1.643%",
          "marketCap": "1,741,383,037,066",
          "url": "/market-activity/stocks/tsm"
        },
        {
          "symbol": "TSLA",
          "name": "Tesla, Inc. Common Stock",
          "lastsale": "$421.96",
          "netchange": "0.15",
          "pctchange": "0.036%",
          "marketCap": "1,583,376,199,969",
          "url": "/market-activity/stocks/tsla"
        },
        {
          "symbol": "AVGO",
          "name": "Broadcom Inc. Common Stock",
          "lastsale": "$320.33",
          "netchange": "-10.78",
          "pctchange": "-3.256%",
          "marketCap": "1,518,772,236,034",
          "url": "/market-activity/stocks/avgo"
        }
      ]
    },
    "totalrecords": 7080,
    "asof": "Last price as of Dec 29, 2026"
  },
  "message": null,
  "status": {
    "rCode": 200,
    "bCodeMessage": null,
    "developerMessage": null
  }
}
```


### Finanças

https://api.nasdaq.com/api/company/AAPL/financials

Resposta:
```json
{
  "data": {
    "symbol": "AAPL",
    "tabs": {
      "incomeStatementTable": "Income Statement",
      "balanceSheetTable": "Balance Sheet",
      "cashFlowTable": "Cash Flow",
      "financialRatiosTable": "Financial Ratios"
    },
    "incomeStatementTable": {
      "asOf": null,
      "headers": {
        "value1": "Period Ending:",
        "value2": "9/27/2025",
        "value3": "9/28/2024",
        "value4": "9/30/2023",
        "value5": "9/24/2022"
      },
      "rows": [
        {
          "value1": "Total Revenue",
          "value2": "$416,161,000",
          "value3": "$391,035,000",
          "value4": "$383,285,000",
          "value5": "$394,328,000"
        },
        {
          "value1": "Cost of Revenue",
          "value2": "$220,960,000",
          "value3": "$210,352,000",
          "value4": "$214,137,000",
          "value5": "$223,546,000"
        },
        {
          "value1": "Gross Profit",
          "value2": "$195,201,000",
          "value3": "$180,683,000",
          "value4": "$169,148,000",
          "value5": "$170,782,000"
        },
        {
          "value1": "Operating Expenses",
          "value2": "",
          "value3": "",
          "value4": "",
          "value5": ""
        },
        {
          "value1": "Research and Development",
          "value2": "$34,550,000",
          "value3": "$31,370,000",
          "value4": "$29,915,000",
          "value5": "$26,251,000"
        },
        {
          "value1": "Sales, General and Admin.",
          "value2": "$27,601,000",
          "value3": "$26,097,000",
          "value4": "$24,932,000",
          "value5": "$25,094,000"
        },
        {
          "value1": "Non-Recurring Items",
          "value2": "--",
          "value3": "--",
          "value4": "--",
          "value5": "--"
        },
        {
          "value1": "Other Operating Items",
          "value2": "--",
          "value3": "--",
          "value4": "--",
          "value5": "--"
        },
        {
          "value1": "Operating Income",
          "value2": "$133,050,000",
          "value3": "$123,216,000",
          "value4": "$114,301,000",
          "value5": "$119,437,000"
        },
        {
          "value1": "Add'l income/expense items",
          "value2": "-$321,000",
          "value3": "$269,000",
          "value4": "-$565,000",
          "value5": "-$334,000"
        },
        {
          "value1": "Earnings Before Interest and Tax",
          "value2": "$132,729,000",
          "value3": "$123,485,000",
          "value4": "$113,736,000",
          "value5": "$119,103,000"
        },
        {
          "value1": "Interest Expense",
          "value2": "--",
          "value3": "--",
          "value4": "--",
          "value5": "--"
        },
        {
          "value1": "Earnings Before Tax",
          "value2": "$132,729,000",
          "value3": "$123,485,000",
          "value4": "$113,736,000",
          "value5": "$119,103,000"
        },
        {
          "value1": "Income Tax",
          "value2": "$20,719,000",
          "value3": "$29,749,000",
          "value4": "$16,741,000",
          "value5": "$19,300,000"
        },
        {
          "value1": "Minority Interest",
          "value2": "--",
          "value3": "--",
          "value4": "--",
          "value5": "--"
        },
        {
          "value1": "Equity Earnings/Loss Unconsolidated Subsidiary",
          "value2": "--",
          "value3": "--",
          "value4": "--",
          "value5": "--"
        },
        {
          "value1": "Net Income-Cont. Operations",
          "value2": "$112,010,000",
          "value3": "$93,736,000",
          "value4": "$96,995,000",
          "value5": "$99,803,000"
        },
        {
          "value1": "Net Income",
          "value2": "$112,010,000",
          "value3": "$93,736,000",
          "value4": "$96,995,000",
          "value5": "$99,803,000"
        },
        {
          "value1": "Net Income Applicable to Common Shareholders",
          "value2": "$112,010,000",
          "value3": "$93,736,000",
          "value4": "$96,995,000",
          "value5": "$99,803,000"
        }
      ]
    },
    "balanceSheetTable": {
      "asOf": null,
      "headers": {
        "value1": "Period Ending:",
        "value2": "9/27/2025",
        "value3": "9/28/2024",
        "value4": "9/30/2023",
        "value5": "9/24/2022"
      },
      "rows": [
        {
          "value1": "Current Assets",
          "value2": "",
          "value3": "",
          "value4": "",
          "value5": ""
        },
        {
          "value1": "Cash and Cash Equivalents",
          "value2": "$35,934,000",
          "value3": "$29,943,000",
          "value4": "$29,965,000",
          "value5": "$23,646,000"
        },
        {
          "value1": "Short-Term Investments",
          "value2": "$18,763,000",
          "value3": "$35,228,000",
          "value4": "$31,590,000",
          "value5": "$24,658,000"
        },
        {
          "value1": "Net Receivables",
          "value2": "$72,957,000",
          "value3": "$66,243,000",
          "value4": "$60,985,000",
          "value5": "$60,932,000"
        },
        {
          "value1": "Inventory",
          "value2": "$5,718,000",
          "value3": "$7,286,000",
          "value4": "$6,331,000",
          "value5": "$4,946,000"
        },
        {
          "value1": "Other Current Assets",
          "value2": "$14,585,000",
          "value3": "$14,287,000",
          "value4": "$14,695,000",
          "value5": "$21,223,000"
        },
        {
          "value1": "Total Current Assets",
          "value2": "$147,957,000",
          "value3": "$152,987,000",
          "value4": "$143,566,000",
          "value5": "$135,405,000"
        },
        {
          "value1": "Long-Term Assets",
          "value2": "",
          "value3": "",
          "value4": "",
          "value5": ""
        },
        {
          "value1": "Long-Term Investments",
          "value2": "$77,723,000",
          "value3": "$91,479,000",
          "value4": "$100,544,000",
          "value5": "$120,805,000"
        },
        {
          "value1": "Fixed Assets",
          "value2": "$49,834,000",
          "value3": "$45,680,000",
          "value4": "$43,715,000",
          "value5": "$42,117,000"
        },
        {
          "value1": "Goodwill",
          "value2": "--",
          "value3": "--",
          "value4": "--",
          "value5": "--"
        },
        {
          "value1": "Intangible Assets",
          "value2": "--",
          "value3": "--",
          "value4": "--",
          "value5": "--"
        },
        {
          "value1": "Other Assets",
          "value2": "$83,727,000",
          "value3": "$74,834,000",
          "value4": "$64,758,000",
          "value5": "$54,428,000"
        },
        {
          "value1": "Deferred Asset Charges",
          "value2": "--",
          "value3": "--",
          "value4": "--",
          "value5": "--"
        },
        {
          "value1": "Total Assets",
          "value2": "$359,241,000",
          "value3": "$364,980,000",
          "value4": "$352,583,000",
          "value5": "$352,755,000"
        },
        {
          "value1": "Current Liabilities",
          "value2": "",
          "value3": "",
          "value4": "",
          "value5": ""
        },
        {
          "value1": "Accounts Payable",
          "value2": "$69,860,000",
          "value3": "$68,960,000",
          "value4": "$62,611,000",
          "value5": "$64,115,000"
        },
        {
          "value1": "Short-Term Debt / Current Portion of Long-Term Debt",
          "value2": "$20,329,000",
          "value3": "$20,879,000",
          "value4": "$15,807,000",
          "value5": "$21,110,000"
        },
        {
          "value1": "Other Current Liabilities",
          "value2": "$75,442,000",
          "value3": "$86,553,000",
          "value4": "$66,890,000",
          "value5": "$68,757,000"
        },
        {
          "value1": "Total Current Liabilities",
          "value2": "$165,631,000",
          "value3": "$176,392,000",
          "value4": "$145,308,000",
          "value5": "$153,982,000"
        },
        {
          "value1": "Long-Term Debt",
          "value2": "$78,328,000",
          "value3": "$85,750,000",
          "value4": "$95,281,000",
          "value5": "$98,959,000"
        },
        {
          "value1": "Other Liabilities",
          "value2": "$41,549,000",
          "value3": "$45,888,000",
          "value4": "$49,848,000",
          "value5": "$49,142,000"
        },
        {
          "value1": "Deferred Liability Charges",
          "value2": "--",
          "value3": "--",
          "value4": "--",
          "value5": "--"
        },
        {
          "value1": "Misc. Stocks",
          "value2": "--",
          "value3": "--",
          "value4": "--",
          "value5": "--"
        },
        {
          "value1": "Minority Interest",
          "value2": "--",
          "value3": "--",
          "value4": "--",
          "value5": "--"
        },
        {
          "value1": "Total Liabilities",
          "value2": "$285,508,000",
          "value3": "$308,030,000",
          "value4": "$290,437,000",
          "value5": "$302,083,000"
        },
        {
          "value1": "Stock Holders Equity",
          "value2": "",
          "value3": "",
          "value4": "",
          "value5": ""
        },
        {
          "value1": "Common Stocks",
          "value2": "$93,568,000",
          "value3": "$83,276,000",
          "value4": "$73,812,000",
          "value5": "$64,849,000"
        },
        {
          "value1": "Capital Surplus",
          "value2": "-$14,264,000",
          "value3": "-$19,154,000",
          "value4": "-$214,000",
          "value5": "-$3,068,000"
        },
        {
          "value1": "Retained Earnings",
          "value2": "--",
          "value3": "--",
          "value4": "--",
          "value5": "--"
        },
        {
          "value1": "Treasury Stock",
          "value2": "--",
          "value3": "--",
          "value4": "--",
          "value5": "--"
        },
        {
          "value1": "Other Equity",
          "value2": "-$5,571,000",
          "value3": "-$7,172,000",
          "value4": "-$11,452,000",
          "value5": "-$11,109,000"
        },
        {
          "value1": "Total Equity",
          "value2": "$73,733,000",
          "value3": "$56,950,000",
          "value4": "$62,146,000",
          "value5": "$50,672,000"
        },
        {
          "value1": "Total Liabilities & Equity",
          "value2": "$359,241,000",
          "value3": "$364,980,000",
          "value4": "$352,583,000",
          "value5": "$352,755,000"
        }
      ]
    },
    "cashFlowTable": {
      "asOf": null,
      "headers": {
        "value1": "Period Ending:",
        "value2": "9/27/2025",
        "value3": "9/28/2024",
        "value4": "9/30/2023",
        "value5": "9/24/2022"
      },
      "rows": [
        {
          "value1": "Net Income",
          "value2": "$112,010,000",
          "value3": "$93,736,000",
          "value4": "$96,995,000",
          "value5": "$99,803,000"
        },
        {
          "value1": "Cash Flows-Operating Activities",
          "value2": "",
          "value3": "",
          "value4": "",
          "value5": ""
        },
        {
          "value1": "Depreciation",
          "value2": "$11,698,000",
          "value3": "$11,445,000",
          "value4": "$11,519,000",
          "value5": "$11,104,000"
        },
        {
          "value1": "Net Income Adjustments",
          "value2": "$12,774,000",
          "value3": "$9,422,000",
          "value4": "$8,606,000",
          "value5": "$10,044,000"
        },
        {
          "value1": "Changes in Operating Activities",
          "value2": "",
          "value3": "",
          "value4": "",
          "value5": ""
        },
        {
          "value1": "Accounts Receivable",
          "value2": "-$7,029,000",
          "value3": "-$5,144,000",
          "value4": "-$417,000",
          "value5": "-$9,343,000"
        },
        {
          "value1": "Changes in Inventories",
          "value2": "$1,400,000",
          "value3": "-$1,046,000",
          "value4": "-$1,618,000",
          "value5": "$1,484,000"
        },
        {
          "value1": "Other Operating Activities",
          "value2": "-$9,197,000",
          "value3": "-$11,731,000",
          "value4": "-$5,684,000",
          "value5": "-$6,499,000"
        },
        {
          "value1": "Liabilities",
          "value2": "-$10,174,000",
          "value3": "$21,572,000",
          "value4": "$1,142,000",
          "value5": "$15,558,000"
        },
        {
          "value1": "Net Cash Flow-Operating",
          "value2": "$111,482,000",
          "value3": "$118,254,000",
          "value4": "$110,543,000",
          "value5": "$122,151,000"
        },
        {
          "value1": "Cash Flows-Investing Activities",
          "value2": "",
          "value3": "",
          "value4": "",
          "value5": ""
        },
        {
          "value1": "Capital Expenditures",
          "value2": "-$12,715,000",
          "value3": "-$9,447,000",
          "value4": "-$10,959,000",
          "value5": "-$10,708,000"
        },
        {
          "value1": "Investments",
          "value2": "$29,390,000",
          "value3": "$13,690,000",
          "value4": "$16,001,000",
          "value5": "-$9,560,000"
        },
        {
          "value1": "Other Investing Activities",
          "value2": "-$1,480,000",
          "value3": "-$1,308,000",
          "value4": "-$1,337,000",
          "value5": "-$2,086,000"
        },
        {
          "value1": "Net Cash Flows-Investing",
          "value2": "$15,195,000",
          "value3": "$2,935,000",
          "value4": "$3,705,000",
          "value5": "-$22,354,000"
        },
        {
          "value1": "Cash Flows-Financing Activities",
          "value2": "",
          "value3": "",
          "value4": "",
          "value5": ""
        },
        {
          "value1": "Sale and Purchase of Stock",
          "value2": "-$90,711,000",
          "value3": "-$94,949,000",
          "value4": "-$77,550,000",
          "value5": "-$89,402,000"
        },
        {
          "value1": "Net Borrowings",
          "value2": "-$8,483,000",
          "value3": "-$5,998,000",
          "value4": "-$9,901,000",
          "value5": "-$123,000"
        },
        {
          "value1": "Other Financing Activities",
          "value2": "-$6,071,000",
          "value3": "-$5,802,000",
          "value4": "-$6,012,000",
          "value5": "-$6,383,000"
        },
        {
          "value1": "Net Cash Flows-Financing",
          "value2": "-$120,686,000",
          "value3": "-$121,983,000",
          "value4": "-$108,488,000",
          "value5": "-$110,749,000"
        },
        {
          "value1": "Effect of Exchange Rate",
          "value2": "--",
          "value3": "--",
          "value4": "--",
          "value5": "--"
        },
        {
          "value1": "Net Cash Flow",
          "value2": "$5,991,000",
          "value3": "-$794,000",
          "value4": "$5,760,000",
          "value5": "-$10,952,000"
        }
      ]
    },
    "financialRatiosTable": {
      "asOf": null,
      "headers": {
        "value1": "Period Ending:",
        "value2": "9/27/2025",
        "value3": "9/28/2024",
        "value4": "9/30/2023",
        "value5": "9/24/2022"
      },
      "rows": [
        {
          "value1": "Liquidity Ratios",
          "value2": "",
          "value3": "",
          "value4": "",
          "value5": ""
        },
        {
          "value1": "Current Ratio",
          "value2": "89.32929%",
          "value3": "86.73126%",
          "value4": "98.80117%",
          "value5": "87.9356%"
        },
        {
          "value1": "Quick Ratio",
          "value2": "85.87704%",
          "value3": "82.60068%",
          "value4": "94.44422%",
          "value5": "84.72354%"
        },
        {
          "value1": "Cash Ratio",
          "value2": "33.02341%",
          "value3": "36.94669%",
          "value4": "42.36174%",
          "value5": "31.3699%"
        },
        {
          "value1": "Profitability Ratios",
          "value2": "",
          "value3": "",
          "value4": "",
          "value5": ""
        },
        {
          "value1": "Gross Margin",
          "value2": "46.90516%",
          "value3": "46.20635%",
          "value4": "44.13113%",
          "value5": "43.30963%"
        },
        {
          "value1": "Operating Margin",
          "value2": "31.9708%",
          "value3": "31.51022%",
          "value4": "29.82141%",
          "value5": "30.28874%"
        },
        {
          "value1": "Pre-Tax Margin",
          "value2": "31.89367%",
          "value3": "31.57901%",
          "value4": "29.674%",
          "value5": "30.20404%"
        },
        {
          "value1": "Profit Margin",
          "value2": "26.91506%",
          "value3": "23.97126%",
          "value4": "25.30623%",
          "value5": "25.30964%"
        },
        {
          "value1": "Pre-Tax ROE",
          "value2": "180.01302%",
          "value3": "216.83055%",
          "value4": "183.01419%",
          "value5": "235.04697%"
        },
        {
          "value1": "After Tax ROE",
          "value2": "151.91298%",
          "value3": "164.5935%",
          "value4": "156.07601%",
          "value5": "196.95887%"
        }
      ]
    }
  },
  "message": null,
  "status": {
    "rCode": 200,
    "bCodeMessage": null,
    "developerMessage": null
  }
}
```


### Análise Técnica

https://api.nasdaq.com/api/analyst/AAPL/earnings-date

Resposta:
```json
{
  "data": {
    "reportText": "Our vendor, Zacks Investment Research, hasn't provided us with the upcoming earnings report date.",
    "heading": "AAPL Earnings Date",
    "announcement": "Earnings announcement* for AAPL: ",
    "eQRResposeModel": {
      "text": [
        "AAPL has a \"high\" Earnings Quality Ranking (EQR) for the 1st week. Earnings quality refers to the extent to which current earnings predict future earnings. \"High-quality\" earnings are expected to persist, while \"low-quality\" earnings do not. EQR is a weekly ranking of relative earnings quality for a large universe of publicly traded US equities. Companies are compared to peers in their industry. Find out more about EQR data."
      ],
      "boldText": null,
      "dataLinkUrl": {
        "label": "Find out more about EQR data",
        "value": "https://data.nasdaq.com/databases/EQR"
      }
    }
  },
  "message": null,
  "status": {
    "rCode": 200,
    "bCodeMessage": null,
    "developerMessage": null
  }
}
```

const fs = require('fs');
const filepath = 'data/vehicles.json';

let data = [];
try {
  data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
} catch (e) {
  console.error('Failed to read json:', e);
}

const samples = [
  {
    "id": "sample-1",
    "isDisplayed": true,
    "make": "Porsche",
    "model": "911 Carrera S",
    "year": "2023",
    "price": "145000",
    "mileage": "3200",
    "status": "Available",
    "bodyType": "Coupe",
    "fuelType": "Gasoline",
    "transmission": "Automatic",
    "vin": "WP0AB2A9XS123456",
    "features": ["Sport Chrono", "Carbon Fiber Roof", "PDLS+"],
    "images": [
      "https://images.unsplash.com/photo-1503376713353-02f67de44cb0?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1563720225134-2e91219fc3fd?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1620882855913-c97aee0f01a3?auto=format&fit=crop&q=80"
    ],
    "specs": {
      "engine": "3.0L Twin-Turbo H6",
      "horsepower": "443 hp",
      "drivetrain": "RWD",
      "mpg": "18 City / 23 Hwy"
    },
    "displayOrder": 1
  },
  {
    "id": "sample-2",
    "isDisplayed": true,
    "make": "Mercedes-Benz",
    "model": "G 63 AMG",
    "year": "2022",
    "price": "185000",
    "mileage": "12500",
    "status": "Available",
    "bodyType": "SUV",
    "fuelType": "Gasoline",
    "transmission": "Automatic",
    "vin": "WDC4632761X654321",
    "features": ["Exclusive Interior Plus", "Night Package", "Burmester Audio"],
    "images": [
      "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1533106418989-88406c7e3f81?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80"
    ],
    "specs": {
      "engine": "4.0L V8 Biturbo",
      "horsepower": "577 hp",
      "drivetrain": "AWD",
      "mpg": "13 City / 16 Hwy"
    },
    "displayOrder": 2
  },
  {
    "id": "sample-3",
    "isDisplayed": true,
    "make": "Audi",
    "model": "RS e-tron GT",
    "year": "2024",
    "price": "152000",
    "mileage": "800",
    "status": "Available",
    "bodyType": "Sedan",
    "fuelType": "Electric",
    "transmission": "Automatic",
    "vin": "WAUZZZF1X4739281",
    "features": ["Year One Package", "Carbon Ceramic Brakes", "Matrix LED"],
    "images": [
      "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80"
    ],
    "specs": {
      "engine": "Dual Electric Motors",
      "horsepower": "637 hp",
      "drivetrain": "AWD",
      "mpg": "TBD"
    },
    "displayOrder": 3
  },
  {
    "id": "sample-4",
    "isDisplayed": true,
    "make": "Aston Martin",
    "model": "DB11 Volante",
    "year": "2021",
    "price": "168000",
    "mileage": "8900",
    "status": "Reserved",
    "bodyType": "Convertible",
    "fuelType": "Gasoline",
    "transmission": "Automatic",
    "vin": "SCFDB11X5620001",
    "features": ["Q Exclusive Color", "Bang & Olufsen", "Ventilated Seats"],
    "images": [
      "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542382029-79282bcbd9a3?auto=format&fit=crop&q=80"
    ],
    "specs": {
      "engine": "4.0L Twin-Turbo V8",
      "horsepower": "503 hp",
      "drivetrain": "RWD",
      "mpg": "18 City / 24 Hwy"
    },
    "displayOrder": 4
  },
  {
    "id": "sample-5",
    "isDisplayed": false,
    "make": "Range Rover",
    "model": "Autobiography",
    "year": "2023",
    "price": "162000",
    "mileage": "4500",
    "status": "Sold",
    "bodyType": "SUV",
    "fuelType": "Hybrid",
    "transmission": "Automatic",
    "vin": "SALGS2EU1XH399999",
    "features": ["SV Bespoke Paint", "Meridian Signature Sound", "Executive Class Rear Seating"],
    "images": [
      "https://images.unsplash.com/photo-1655208479069-0268ec3b2fa5?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1533106418989-88406c7e3f81?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&q=80"
    ],
    "specs": {
      "engine": "PHEV inline-6",
      "horsepower": "434 hp",
      "drivetrain": "AWD",
      "mpg": "TBD"
    },
    "displayOrder": 5
  }
];

// Add the 5 samples to data
data = data.concat(samples);
fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
console.log('Added 5 sample vehicles with 3 images each.');

const raspi = require('raspi');
const I2C = require('raspi-i2c').I2C;
const VL53L0X = require('../');

function wait(time) {
  return new Promise( resolve => {
    setTimeout(() => {
      resolve();
    }, time)
  })
}

raspi.init(async () => {
  const i2c = new I2C();
  const sensor = new VL53L0X(i2c);
  sensor.setTimeout(500);
  if (await sensor.init()) {
    console.log('init OK');

    // Start continuous back-to-back mode (take readings as
    // fast as possible).  To use continuous timed mode
    // instead, provide a desired inter-measurement period in
    // ms (e.g. sensor.startContinuous(100)).
    sensor.startContinuous();
  
    while (true) {
      await wait(100);
      console.log(await sensor.readRangeContinuousMillimeters());
      if (sensor.timeoutOccurred()) { console.log(" TIMEOUT"); }
    }
  }
});

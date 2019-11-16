const raspi = require('raspi');
const I2C = require('raspi-i2c').I2C;
const VL53L0X = require('../');

function long_range(sensor) {
    // lower the return signal rate limit (default is 0.25 MCPS)
    sensor.setSignalRateLimit(0.1);
    // increase laser pulse periods (defaults are 14 and 10 PCLKs)
    await sensor.setVcselPulsePeriod(VL53L0X.VcselPeriodPreRange, 18);
    await sensor.setVcselPulsePeriod(VL53L0X.VcselPeriodFinalRange, 14);
}

function high_speed(sensor) {
  // reduce timing budget to 20 ms (default is about 33 ms)
  sensor.setMeasurementTimingBudget(20000);
}

function high_accuracy(sensor) {
  // increase timing budget to 200 ms
  sensor.setMeasurementTimingBudget(200000);
}

raspi.init(async () => {
  const i2c = new I2C();
  const sensor = new VL53L0X(i2c);
  if (await sensor.init()) {
    console.log('init OK');

    long_range(sensor);
    high_speed(sensor); // or high_accuracy(sensor);
  
    while (true) {
      console.log(await sensor.readRangeSingleMillimeters());
      if (sensor.timeoutOccurred()) { console.log(" TIMEOUT"); }
    }
  }
});

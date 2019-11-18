const raspi = require('raspi');
const I2C = require('raspi-i2c').I2C;
const VL53L0X = require('../');
const gpio = require('raspi-gpio');

function wait(time) {
  return new Promise( resolve => {
    setTimeout(() => {
      resolve();
    }, time)
  })
}

raspi.init(async () => {
  const i2c = new I2C();
  const sensor0 = new VL53L0X(i2c);
  const sensor1 = new VL53L0X(i2c);

  sensor0.sw = new gpio.DigitalOutput('GPIO26');
  sensor1.sw = new gpio.DigitalOutput('GPIO6');
  
  sensor0.sw.write(0);
  sensor1.sw.write(0);
  await wait(100);

  sensor0.sw.write(1);
  await wait(100);

  sensor0.setTimeout(100);
  if (!await sensor0.init()) return;
  sensor0.startContinuous();
  sensor0.address = 0x2A;

  sensor1.sw.write(1);
  await wait(100);

  sensor1.setTimeout(100);
  if (!await sensor1.init()) return;
  sensor1.startContinuous();
  sensor1.address = 0x2B;

  console.log('init OK');

  while (true) {
    await wait(100);
    console.log(`0:${await sensor0.readRangeContinuousMillimeters()}`);
    if (sensor0.timeoutOccurred()) { console.log(" TIMEOUT sensor0"); }
    console.log(`1:${await sensor1.readRangeContinuousMillimeters()}`);
    if (sensor1.timeoutOccurred()) { console.log(" TIMEOUT sensor1"); }
  }
});

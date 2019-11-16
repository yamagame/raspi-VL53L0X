# VL53L0X Node module on Raspberry Pi

This project provides a simplified node module on Raspberry Pi to the ST VL53L0X API (ST Microelectronics).

## Summary

This is a module for Node that helps interface with ST's [VL53L0X time-of-flight distance sensor](https://www.pololu.com/product/2490). The library makes it simple to configure the sensor and read range data from it via I&sup2;C.

This module is based on [VL53L0X library for Arduino](https://github.com/pololu/vl53l0x-arduino).

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 6.0.0 or higher is required.

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm install @yamagame-org@raspi-VL53L0X
```

## Hardware

Make the following connections between the Raspberry Pi and the VL53L0X board:

    Raspbarry Pi   VL53L0X board
    ------------   -------------
              5V - VIN
             GND - GND
             SDA - SDA
             SCL - SCL

## Examples

Several examples are available that show how to use the library.

- [continuous.js](./examples/continuous.js)
- [single.js](./examples/single.js)

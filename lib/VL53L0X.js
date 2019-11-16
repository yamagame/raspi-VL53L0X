const process = require('process');
// const colors = require('colors');

const SYSRANGE_START                              = 0x00;

const SYSTEM_THRESH_HIGH                          = 0x0C;
const SYSTEM_THRESH_LOW                           = 0x0E;

const SYSTEM_SEQUENCE_CONFIG                      = 0x01;
const SYSTEM_RANGE_CONFIG                         = 0x09;
const SYSTEM_INTERMEASUREMENT_PERIOD              = 0x04;

const SYSTEM_INTERRUPT_CONFIG_GPIO                = 0x0A;

const GPIO_HV_MUX_ACTIVE_HIGH                     = 0x84;

const SYSTEM_INTERRUPT_CLEAR                      = 0x0B;

const RESULT_INTERRUPT_STATUS                     = 0x13;
const RESULT_RANGE_STATUS                         = 0x14;

const RESULT_CORE_AMBIENT_WINDOW_EVENTS_RTN       = 0xBC;
const RESULT_CORE_RANGING_TOTAL_EVENTS_RTN        = 0xC0;
const RESULT_CORE_AMBIENT_WINDOW_EVENTS_REF       = 0xD0;
const RESULT_CORE_RANGING_TOTAL_EVENTS_REF        = 0xD4;
const RESULT_PEAK_SIGNAL_RATE_REF                 = 0xB6;

const ALGO_PART_TO_PART_RANGE_OFFSET_MM           = 0x28;

const I2C_SLAVE_DEVICE_ADDRESS                    = 0x8A;

const MSRC_CONFIG_CONTROL                         = 0x60;

const PRE_RANGE_CONFIG_MIN_SNR                    = 0x27;
const PRE_RANGE_CONFIG_VALID_PHASE_LOW            = 0x56;
const PRE_RANGE_CONFIG_VALID_PHASE_HIGH           = 0x57;
const PRE_RANGE_MIN_COUNT_RATE_RTN_LIMIT          = 0x64;

const FINAL_RANGE_CONFIG_MIN_SNR                  = 0x67;
const FINAL_RANGE_CONFIG_VALID_PHASE_LOW          = 0x47;
const FINAL_RANGE_CONFIG_VALID_PHASE_HIGH         = 0x48;
const FINAL_RANGE_CONFIG_MIN_COUNT_RATE_RTN_LIMIT = 0x44;

const PRE_RANGE_CONFIG_SIGMA_THRESH_HI            = 0x61;
const PRE_RANGE_CONFIG_SIGMA_THRESH_LO            = 0x62;

const PRE_RANGE_CONFIG_VCSEL_PERIOD               = 0x50;
const PRE_RANGE_CONFIG_TIMEOUT_MACROP_HI          = 0x51;
const PRE_RANGE_CONFIG_TIMEOUT_MACROP_LO          = 0x52;

const SYSTEM_HISTOGRAM_BIN                        = 0x81;
const HISTOGRAM_CONFIG_INITIAL_PHASE_SELECT       = 0x33;
const HISTOGRAM_CONFIG_READOUT_CTRL               = 0x55;

const FINAL_RANGE_CONFIG_VCSEL_PERIOD             = 0x70;
const FINAL_RANGE_CONFIG_TIMEOUT_MACROP_HI        = 0x71;
const FINAL_RANGE_CONFIG_TIMEOUT_MACROP_LO        = 0x72;
const CROSSTALK_COMPENSATION_PEAK_RATE_MCPS       = 0x20;

const MSRC_CONFIG_TIMEOUT_MACROP                  = 0x46;

const SOFT_RESET_GO2_SOFT_RESET_N                 = 0xBF;
const IDENTIFICATION_MODEL_ID                     = 0xC0;
const IDENTIFICATION_REVISION_ID                  = 0xC2;

const OSC_CALIBRATE_VAL                           = 0xF8;

const GLOBAL_CONFIG_VCSEL_WIDTH                   = 0x32;
const GLOBAL_CONFIG_SPAD_ENABLES_REF_0            = 0xB0;
const GLOBAL_CONFIG_SPAD_ENABLES_REF_1            = 0xB1;
const GLOBAL_CONFIG_SPAD_ENABLES_REF_2            = 0xB2;
const GLOBAL_CONFIG_SPAD_ENABLES_REF_3            = 0xB3;
const GLOBAL_CONFIG_SPAD_ENABLES_REF_4            = 0xB4;
const GLOBAL_CONFIG_SPAD_ENABLES_REF_5            = 0xB5;

const GLOBAL_CONFIG_REF_EN_START_SELECT           = 0xB6;
const DYNAMIC_SPAD_NUM_REQUESTED_REF_SPAD         = 0x4E;
const DYNAMIC_SPAD_REF_EN_START_OFFSET            = 0x4F;
const POWER_MANAGEMENT_GO1_POWER_FORCE            = 0x80;

const VHV_CONFIG_PAD_SCL_SDA__EXTSUP_HV           = 0x89;

const ALGO_PHASECAL_LIM                           = 0x30;
const ALGO_PHASECAL_CONFIG_TIMEOUT                = 0x30;

const VcselPeriodPreRange = 0;
const VcselPeriodFinalRange = 1;

function millis() {
  var v = Math.floor(parseInt(process.hrtime.bigint()/BigInt(1000)));
  return v;
}

const ADDRESS_DEFAULT = 0x29;

// Decode VCSEL (vertical cavity surface emitting laser) pulse period in PCLKs
// from register value
// based on VL53L0X_decode_vcsel_period()
const decodeVcselPeriod = (reg_val) => (((reg_val) + 1) << 1)

// Encode VCSEL pulse period register value from period in PCLKs
// based on VL53L0X_encode_vcsel_period()
const encodeVcselPeriod = (period_pclks) => (((period_pclks) >> 1) - 1)

// Calculate macro period in *nanoseconds* from VCSEL period in PCLKs
// based on VL53L0X_calc_macro_period_ps()
// PLL_period_ps = 1655; macro_period_vclks = 2304
const calcMacroPeriod = (vcsel_period_pclks) => (((2304 * (vcsel_period_pclks) * 1655) + 500) / 1000)

const dummyI2C = {
  readByteSync: function(address, register) {
    return 0;
  },
  readWordSync: function(address, register) {
    return 0;
  },
  readSync: function(address, register, length) {
    return new Buffer(length);
  },
  writeByteSync: function(address, register, value) {
  },
  writeWordSync: function(address, register, value) {
  },
  writeSync: function(address, register, buffer) {
  },
}

function nextTick() {
  return new Promise( resolve => {
    process.nextTick(() => {
      resolve();
    })
  })
}

function toHEX(val) {
 return '0x'+('00'+(val.toString(16).toUpperCase())).slice(-2);
}

function toHEX16(val) {
 return '0x'+('0000'+(val.toString(16).toUpperCase())).slice(-4);
}

function toHEX32(val) {
 return '0x'+('00000000'+(val.toString(16).toUpperCase())).slice(-8);
}

function toHEXBuffer(buff) {
  let t = '';
  for (var i=0;i<buff.length;i++) {
    if (i > 0) t += ' ';
    t += toHEX(buff[i]);
  }
  return t;
}

class VL53L0X {
  constructor(i2c=dummyI2C) {
    this._address = ADDRESS_DEFAULT;
    this.measurement_timing_budget_us = 0;
    this.io_timeout = 0;
    this.did_timeout = false;
    this.stop_variable = 0;
    this.timeout_start_ms = 0;
    this.i2c = i2c;
  }

  startTimeout() {
    this.timeout_start_ms = millis();
  }

  checkTimeoutExpired() {
    return (this.io_timeout > 0 && ((millis() - this.timeout_start_ms) > this.io_timeout))
  }

  readReg(register) {
    const retval = this.i2c.readByteSync(this._address, register);
    //console.log(`<: ${toHEX(this._address)} ${toHEX(register)} ${toHEX(retval)}`.blue);
    return retval;
  }

  readReg16Bit(register) {
    const buffer = this.i2c.readSync(this._address, register, 2);
    const retval = buffer.readUInt16BE();
    //console.log(`<: ${toHEX(this._address)} ${toHEX(register)} ${toHEX16(retval)}`.blue);
    return retval;
  }

  readReg32Bit(register) {
    const buffer = this.i2c.readSync(this._address, register, 4);
    const retval = buffer.readUInt32LE();
    //console.log(`<: ${toHEX(this._address)} ${toHEX(register)} ${toHEX32(retval)}`.blue);
    return retval;
  }

  readMulti(register, length) {
    const buffer = this.i2c.readSync(this._address, register, length);
    //console.log(buffer);
    //console.log(`<: ${toHEX(this._address)} ${toHEX(register)} ${toHEXBuffer(buffer)}`.blue);
    return buffer;
  }

  writeReg(register, value) {
    //console.log(`>: ${toHEX(this._address)} ${toHEX(register)} ${toHEX(value)}`.red);
    this.i2c.writeByteSync(this._address, register, value);
  }

  writeReg16Bit(register, value) {
    //console.log(`>: ${toHEX(this._address)} ${toHEX(register)} ${toHEX16(value)}`.red);
    const buffer = Buffer.alloc(2)
    buffer.writeUInt16BE(value);
    this.i2c.writeSync(this._address, register, buffer);
  }

  writeReg32Bit(register, value) {
    //console.log(`>: ${toHEX(this._address)} ${toHEX(register)} ${toHEX32(value)}`.red);
    const buffer = Buffer.alloc(4)
    buffer.writeUInt32LE(value);
    this.i2c.writeSync(this._address, register, buffer);
  }

  writeMulti(register, buffer) {
    //console.log(`>: ${toHEX(this._address)} ${toHEX(register)} ${toHEXBuffer(buffer)}`.red);
    this.i2c.writeSync(this._address, register, buffer);
  }

  get address() {
    return this._address;
  }

  set address(new_addr) {
    this.writeReg(I2C_SLAVE_DEVICE_ADDRESS, new_addr & 0x7F);
    this._address = new_addr;
  }

  async init(io_2v8=true) {
    // check model ID register (value specified in datasheet)
    if (this.readReg(IDENTIFICATION_MODEL_ID) != 0xEE) { return false; }

    // VL53L0X_DataInit() begin
    //console.log(`VL53L0X_DataInit() begin`);

    // sensor uses 1V8 mode for I/O by default; switch to 2V8 mode if necessary
    if (io_2v8)
    {
      this.writeReg(VHV_CONFIG_PAD_SCL_SDA__EXTSUP_HV,
      this.readReg(VHV_CONFIG_PAD_SCL_SDA__EXTSUP_HV) | 0x01); // set bit 0
    }

    // "Set I2C standard mode"
    this.writeReg(0x88, 0x00);

    this.writeReg(0x80, 0x01);
    this.writeReg(0xFF, 0x01);
    this.writeReg(0x00, 0x00);
    this.stop_variable = this.readReg(0x91);
    this.writeReg(0x00, 0x01);
    this.writeReg(0xFF, 0x00);
    this.writeReg(0x80, 0x00);

    // disable SIGNAL_RATE_MSRC (bit 1) and SIGNAL_RATE_PRE_RANGE (bit 4) limit checks
    this.writeReg(MSRC_CONFIG_CONTROL, this.readReg(MSRC_CONFIG_CONTROL) | 0x12);

    // set final range signal rate limit to 0.25 MCPS (million counts per second)
    this.setSignalRateLimit(0.25);

    this.writeReg(SYSTEM_SEQUENCE_CONFIG, 0xFF);

    // VL53L0X_DataInit() end
    //console.log(`VL53L0X_DataInit() end`);

    // VL53L0X_StaticInit() begin
    //console.log(`VL53L0X_StaticInit() begin`);

    const spadInfo = {};
    if (!await this.getSpadInfo(spadInfo)) { return false; }

    // The SPAD map (RefGoodSpadMap) is read by VL53L0X_get_info_from_device() in
    // the API, but the same data seems to be more easily readable from
    // GLOBAL_CONFIG_SPAD_ENABLES_REF_0 through _6, so read it from there
    const ref_spad_map = this.readMulti(GLOBAL_CONFIG_SPAD_ENABLES_REF_0, 6);

    // -- VL53L0X_set_reference_spads() begin (assume NVM values are valid)
    //console.log(`VL53L0X_set_reference_spads() begin`);

    this.writeReg(0xFF, 0x01);
    this.writeReg(DYNAMIC_SPAD_REF_EN_START_OFFSET, 0x00);
    this.writeReg(DYNAMIC_SPAD_NUM_REQUESTED_REF_SPAD, 0x2C);
    this.writeReg(0xFF, 0x00);
    this.writeReg(GLOBAL_CONFIG_REF_EN_START_SELECT, 0xB4);

    const first_spad_to_enable = spadInfo.type_is_aperture ? 12 : 0; // 12 is the first aperture spad
    let spads_enabled = 0;
    
    //console.log(`first_spad_to_enable ${first_spad_to_enable}`);
    //console.log(`spads_enabled ${spads_enabled} spadInfo.count ${spadInfo.count}`);

    for (var i = 0; i < 48; i++)
    {
      if (i < first_spad_to_enable || spads_enabled == spadInfo.count)
      {
        // This bit is lower than the first one that should be enabled, or
        // (reference_spad_count) bits have already been enabled, so zero this bit
        ref_spad_map[i / 8] &= ~(1 << (i % 8));
      }
      else if ((ref_spad_map[i / 8] >> (i % 8)) & 0x1)
      {
        spads_enabled++;
      }
    }

    this.writeMulti(GLOBAL_CONFIG_SPAD_ENABLES_REF_0, ref_spad_map);

    // -- VL53L0X_set_reference_spads() end
    //console.log(`VL53L0X_set_reference_spads() end`);

    // -- VL53L0X_load_tuning_settings() begin
    //console.log(`VL53L0X_load_tuning_settings() begin`);
    // DefaultTuningSettings from vl53l0x_tuning.h

    this.writeReg(0xFF, 0x01);
    this.writeReg(0x00, 0x00);

    this.writeReg(0xFF, 0x00);
    this.writeReg(0x09, 0x00);
    this.writeReg(0x10, 0x00);
    this.writeReg(0x11, 0x00);

    this.writeReg(0x24, 0x01);
    this.writeReg(0x25, 0xFF);
    this.writeReg(0x75, 0x00);

    this.writeReg(0xFF, 0x01);
    this.writeReg(0x4E, 0x2C);
    this.writeReg(0x48, 0x00);
    this.writeReg(0x30, 0x20);

    this.writeReg(0xFF, 0x00);
    this.writeReg(0x30, 0x09);
    this.writeReg(0x54, 0x00);
    this.writeReg(0x31, 0x04);
    this.writeReg(0x32, 0x03);
    this.writeReg(0x40, 0x83);
    this.writeReg(0x46, 0x25);
    this.writeReg(0x60, 0x00);
    this.writeReg(0x27, 0x00);
    this.writeReg(0x50, 0x06);
    this.writeReg(0x51, 0x00);
    this.writeReg(0x52, 0x96);
    this.writeReg(0x56, 0x08);
    this.writeReg(0x57, 0x30);
    this.writeReg(0x61, 0x00);
    this.writeReg(0x62, 0x00);
    this.writeReg(0x64, 0x00);
    this.writeReg(0x65, 0x00);
    this.writeReg(0x66, 0xA0);

    this.writeReg(0xFF, 0x01);
    this.writeReg(0x22, 0x32);
    this.writeReg(0x47, 0x14);
    this.writeReg(0x49, 0xFF);
    this.writeReg(0x4A, 0x00);

    this.writeReg(0xFF, 0x00);
    this.writeReg(0x7A, 0x0A);
    this.writeReg(0x7B, 0x00);
    this.writeReg(0x78, 0x21);

    this.writeReg(0xFF, 0x01);
    this.writeReg(0x23, 0x34);
    this.writeReg(0x42, 0x00);
    this.writeReg(0x44, 0xFF);
    this.writeReg(0x45, 0x26);
    this.writeReg(0x46, 0x05);
    this.writeReg(0x40, 0x40);
    this.writeReg(0x0E, 0x06);
    this.writeReg(0x20, 0x1A);
    this.writeReg(0x43, 0x40);

    this.writeReg(0xFF, 0x00);
    this.writeReg(0x34, 0x03);
    this.writeReg(0x35, 0x44);

    this.writeReg(0xFF, 0x01);
    this.writeReg(0x31, 0x04);
    this.writeReg(0x4B, 0x09);
    this.writeReg(0x4C, 0x05);
    this.writeReg(0x4D, 0x04);

    this.writeReg(0xFF, 0x00);
    this.writeReg(0x44, 0x00);
    this.writeReg(0x45, 0x20);
    this.writeReg(0x47, 0x08);
    this.writeReg(0x48, 0x28);
    this.writeReg(0x67, 0x00);
    this.writeReg(0x70, 0x04);
    this.writeReg(0x71, 0x01);
    this.writeReg(0x72, 0xFE);
    this.writeReg(0x76, 0x00);
    this.writeReg(0x77, 0x00);

    this.writeReg(0xFF, 0x01);
    this.writeReg(0x0D, 0x01);

    this.writeReg(0xFF, 0x00);
    this.writeReg(0x80, 0x01);
    this.writeReg(0x01, 0xF8);

    this.writeReg(0xFF, 0x01);
    this.writeReg(0x8E, 0x01);
    this.writeReg(0x00, 0x01);
    this.writeReg(0xFF, 0x00);
    this.writeReg(0x80, 0x00);

    // -- VL53L0X_load_tuning_settings() end
    //console.log(`VL53L0X_load_tuning_settings() end`);

    // "Set interrupt config to new sample ready"
    // -- VL53L0X_SetGpioConfig() begin
    //console.log(`VL53L0X_SetGpioConfig() begin`);

    this.writeReg(SYSTEM_INTERRUPT_CONFIG_GPIO, 0x04);
    this.writeReg(GPIO_HV_MUX_ACTIVE_HIGH, this.readReg(GPIO_HV_MUX_ACTIVE_HIGH) & ~0x10); // active low
    this.writeReg(SYSTEM_INTERRUPT_CLEAR, 0x01);

    // -- VL53L0X_SetGpioConfig() end
    //console.log(`VL53L0X_SetGpioConfig() end`);

    this.measurement_timing_budget_us = this.getMeasurementTimingBudget();

    // "Disable MSRC and TCC by default"
    // MSRC = Minimum Signal Rate Check
    // TCC = Target CentreCheck
    // -- VL53L0X_SetSequenceStepEnable() begin
    //console.log(`VL53L0X_SetSequenceStepEnable() begin`);

    this.writeReg(SYSTEM_SEQUENCE_CONFIG, 0xE8);

    // -- VL53L0X_SetSequenceStepEnable() end
    //console.log(`VL53L0X_SetSequenceStepEnable() end`);

    // "Recalculate timing budget"
    this.setMeasurementTimingBudget(this.measurement_timing_budget_us);

    // VL53L0X_StaticInit() end
    //console.log(`VL53L0X_StaticInit() end`);

    // VL53L0X_PerformRefCalibration() begin (VL53L0X_perform_ref_calibration())

    // -- VL53L0X_perform_vhv_calibration() begin
    //console.log(`VL53L0X_perform_vhv_calibration() begin`);

    this.writeReg(SYSTEM_SEQUENCE_CONFIG, 0x01);
    if (!await this.performSingleRefCalibration(0x40)) { return false; }

    // -- VL53L0X_perform_vhv_calibration() end
    //console.log(`VL53L0X_perform_vhv_calibration() end`);

    // -- VL53L0X_perform_phase_calibration() begin
    //console.log(`VL53L0X_perform_phase_calibration() begin`);

    this.writeReg(SYSTEM_SEQUENCE_CONFIG, 0x02);
    if (!await this.performSingleRefCalibration(0x00)) { return false; }

    // -- VL53L0X_perform_phase_calibration() end
    //console.log(`VL53L0X_perform_phase_calibration() end`);

    // "restore the previous Sequence Config"
    this.writeReg(SYSTEM_SEQUENCE_CONFIG, 0xE8);

    // VL53L0X_PerformRefCalibration() end
    //console.log(`VL53L0X_PerformRefCalibration() end`);

    return true;
  }

  setSignalRateLimit(limit_Mcps) {
    if (limit_Mcps < 0 || limit_Mcps > 511.99) { return false; }
    this.writeReg16Bit(FINAL_RANGE_CONFIG_MIN_COUNT_RATE_RTN_LIMIT, limit_Mcps * (1 << 7));
    return true;
  }

  getSignalRateLimit() {
    return this.readReg16Bit(FINAL_RANGE_CONFIG_MIN_COUNT_RATE_RTN_LIMIT) / (1 << 7);
  }

  setMeasurementTimingBudget(budget_us) {
    const enables = {};
    const timeouts = {};

    const StartOverhead     = 1910;
    const EndOverhead        = 960;
    const MsrcOverhead       = 660;
    const TccOverhead        = 590;
    const DssOverhead        = 690;
    const PreRangeOverhead   = 660;
    const FinalRangeOverhead = 550;

    const MinTimingBudget = 20000;

    if (budget_us < MinTimingBudget) { return false; }

    let used_budget_us = StartOverhead + EndOverhead;

    this.getSequenceStepEnables(enables);
    this.getSequenceStepTimeouts(enables, timeouts);

    if (enables.tcc)
    {
      used_budget_us += (timeouts.msrc_dss_tcc_us + TccOverhead);
    }

    if (enables.dss)
    {
      used_budget_us += 2 * (timeouts.msrc_dss_tcc_us + DssOverhead);
    }
    else if (enables.msrc)
    {
      used_budget_us += (timeouts.msrc_dss_tcc_us + MsrcOverhead);
    }

    if (enables.pre_range)
    {
      used_budget_us += (timeouts.pre_range_us + PreRangeOverhead);
    }

    if (enables.final_range)
    {
      used_budget_us += FinalRangeOverhead;

      // "Note that the final range timeout is determined by the timing
      // budget and the sum of all other timeouts within the sequence.
      // If there is no room for the final range timeout, then an error
      // will be set. Otherwise the remaining time will be applied to
      // the final range."

      if (used_budget_us > budget_us)
      {
        // "Requested timeout too big."
        return false;
      }

      let final_range_timeout_us = budget_us - used_budget_us;

      // set_sequence_step_timeout() begin
      // (SequenceStepId == VL53L0X_SEQUENCESTEP_FINAL_RANGE)

      // "For the final range timeout, the pre-range timeout
      //  must be added. To do this both final and pre-range
      //  timeouts must be expressed in macro periods MClks
      //  because they have different vcsel periods."

      let final_range_timeout_mclks =
        this.timeoutMicrosecondsToMclks(final_range_timeout_us,
                                  timeouts.final_range_vcsel_period_pclks);

      if (enables.pre_range)
      {
        final_range_timeout_mclks += timeouts.pre_range_mclks;
      }

      this.writeReg16Bit(FINAL_RANGE_CONFIG_TIMEOUT_MACROP_HI,
        this.encodeTimeout(final_range_timeout_mclks));

      // set_sequence_step_timeout() end

      this.measurement_timing_budget_us = budget_us; // store for internal reuse
    }
    return true;
  }

  getMeasurementTimingBudget() {
    const enables = {};
    const timeouts = {};

    const StartOverhead     = 1910;
    const EndOverhead        = 960;
    const MsrcOverhead       = 660;
    const TccOverhead        = 590;
    const DssOverhead        = 690;
    const PreRangeOverhead   = 660;
    const FinalRangeOverhead = 550;

    // "Start and end overhead times always present"
    let budget_us = StartOverhead + EndOverhead;

    this.getSequenceStepEnables(enables);
    this.getSequenceStepTimeouts(enables, timeouts);

    if (enables.tcc)
    {
      budget_us += (timeouts.msrc_dss_tcc_us + TccOverhead);
    }

    if (enables.dss)
    {
      budget_us += 2 * (timeouts.msrc_dss_tcc_us + DssOverhead);
    }
    else if (enables.msrc)
    {
      budget_us += (timeouts.msrc_dss_tcc_us + MsrcOverhead);
    }

    if (enables.pre_range)
    {
      budget_us += (timeouts.pre_range_us + PreRangeOverhead);
    }

    if (enables.final_range)
    {
      budget_us += (timeouts.final_range_us + FinalRangeOverhead);
    }

    this.measurement_timing_budget_us = budget_us; // store for internal reuse
    return budget_us;
  }

  async setVcselPulsePeriod(type, period_pclks) {
    let vcsel_period_reg = encodeVcselPeriod(period_pclks);

    let enables = {};
    let timeouts = {};

    this.getSequenceStepEnables(enables);
    this.getSequenceStepTimeouts(enables, timeouts);

    // "Apply specific settings for the requested clock period"
    // "Re-calculate and apply timeouts, in macro periods"

    // "When the VCSEL period for the pre or final range is changed,
    // the corresponding timeout must be read from the device using
    // the current VCSEL period, then the new VCSEL period can be
    // applied. The timeout then must be written back to the device
    // using the new VCSEL period.
    //
    // For the MSRC timeout, the same applies - this timeout being
    // dependant on the pre-range vcsel period."


    if (type == VcselPeriodPreRange)
    {
      // "Set phase check limits"
      switch (period_pclks)
      {
        case 12:
          this.writeReg(PRE_RANGE_CONFIG_VALID_PHASE_HIGH, 0x18);
          break;

        case 14:
          this.writeReg(PRE_RANGE_CONFIG_VALID_PHASE_HIGH, 0x30);
          break;

        case 16:
          this.writeReg(PRE_RANGE_CONFIG_VALID_PHASE_HIGH, 0x40);
          break;

        case 18:
          this.writeReg(PRE_RANGE_CONFIG_VALID_PHASE_HIGH, 0x50);
          break;

        default:
          // invalid period
          return false;
      }
      this.writeReg(PRE_RANGE_CONFIG_VALID_PHASE_LOW, 0x08);

      // apply new VCSEL period
      this.writeReg(PRE_RANGE_CONFIG_VCSEL_PERIOD, vcsel_period_reg);

      // update timeouts

      // set_sequence_step_timeout() begin
      // (SequenceStepId == VL53L0X_SEQUENCESTEP_PRE_RANGE)

      let new_pre_range_timeout_mclks =
        this.timeoutMicrosecondsToMclks(timeouts.pre_range_us, period_pclks);

      this.writeReg16Bit(PRE_RANGE_CONFIG_TIMEOUT_MACROP_HI,
        this.encodeTimeout(new_pre_range_timeout_mclks));

      // set_sequence_step_timeout() end

      // set_sequence_step_timeout() begin
      // (SequenceStepId == VL53L0X_SEQUENCESTEP_MSRC)

      let new_msrc_timeout_mclks =
        this.timeoutMicrosecondsToMclks(timeouts.msrc_dss_tcc_us, period_pclks);

      this.writeReg(MSRC_CONFIG_TIMEOUT_MACROP,
        (new_msrc_timeout_mclks > 256) ? 255 : (new_msrc_timeout_mclks - 1));

      // set_sequence_step_timeout() end
    }
    else if (type == VcselPeriodFinalRange)
    {
      switch (period_pclks)
      {
        case 8:
          this.writeReg(FINAL_RANGE_CONFIG_VALID_PHASE_HIGH, 0x10);
          this.writeReg(FINAL_RANGE_CONFIG_VALID_PHASE_LOW,  0x08);
          this.writeReg(GLOBAL_CONFIG_VCSEL_WIDTH, 0x02);
          this.writeReg(ALGO_PHASECAL_CONFIG_TIMEOUT, 0x0C);
          this.writeReg(0xFF, 0x01);
          this.writeReg(ALGO_PHASECAL_LIM, 0x30);
          this.writeReg(0xFF, 0x00);
          break;

        case 10:
          this.writeReg(FINAL_RANGE_CONFIG_VALID_PHASE_HIGH, 0x28);
          this.writeReg(FINAL_RANGE_CONFIG_VALID_PHASE_LOW,  0x08);
          this.writeReg(GLOBAL_CONFIG_VCSEL_WIDTH, 0x03);
          this.writeReg(ALGO_PHASECAL_CONFIG_TIMEOUT, 0x09);
          this.writeReg(0xFF, 0x01);
          this.writeReg(ALGO_PHASECAL_LIM, 0x20);
          this.writeReg(0xFF, 0x00);
          break;

        case 12:
          this.writeReg(FINAL_RANGE_CONFIG_VALID_PHASE_HIGH, 0x38);
          this.writeReg(FINAL_RANGE_CONFIG_VALID_PHASE_LOW,  0x08);
          this.writeReg(GLOBAL_CONFIG_VCSEL_WIDTH, 0x03);
          this.writeReg(ALGO_PHASECAL_CONFIG_TIMEOUT, 0x08);
          this.writeReg(0xFF, 0x01);
          this.writeReg(ALGO_PHASECAL_LIM, 0x20);
          this.writeReg(0xFF, 0x00);
          break;

        case 14:
          this.writeReg(FINAL_RANGE_CONFIG_VALID_PHASE_HIGH, 0x48);
          this.writeReg(FINAL_RANGE_CONFIG_VALID_PHASE_LOW,  0x08);
          this.writeReg(GLOBAL_CONFIG_VCSEL_WIDTH, 0x03);
          this.writeReg(ALGO_PHASECAL_CONFIG_TIMEOUT, 0x07);
          this.writeReg(0xFF, 0x01);
          this.writeReg(ALGO_PHASECAL_LIM, 0x20);
          this.writeReg(0xFF, 0x00);
          break;

        default:
          // invalid period
          return false;
      }

      // apply new VCSEL period
      this.writeReg(FINAL_RANGE_CONFIG_VCSEL_PERIOD, vcsel_period_reg);

      // update timeouts

      // set_sequence_step_timeout() begin
      // (SequenceStepId == VL53L0X_SEQUENCESTEP_FINAL_RANGE)

      // "For the final range timeout, the pre-range timeout
      //  must be added. To do this both final and pre-range
      //  timeouts must be expressed in macro periods MClks
      //  because they have different vcsel periods."

      let new_final_range_timeout_mclks =
        this.timeoutMicrosecondsToMclks(timeouts.final_range_us, period_pclks);

      if (enables.pre_range)
      {
        new_final_range_timeout_mclks += timeouts.pre_range_mclks;
      }

      this.writeReg16Bit(FINAL_RANGE_CONFIG_TIMEOUT_MACROP_HI,
        this.encodeTimeout(new_final_range_timeout_mclks));

      // set_sequence_step_timeout end
    }
    else
    {
      // invalid type
      return false;
    }

    // "Finally, the timing budget must be re-applied"

    this.setMeasurementTimingBudget(this.measurement_timing_budget_us);

    // "Perform the phase calibration. This is needed after changing on vcsel period."
    // VL53L0X_perform_phase_calibration() begin

    let sequence_config = this.readReg(SYSTEM_SEQUENCE_CONFIG);
    this.writeReg(SYSTEM_SEQUENCE_CONFIG, 0x02);
    await this.performSingleRefCalibration(0x0);
    this.writeReg(SYSTEM_SEQUENCE_CONFIG, sequence_config);

    // VL53L0X_perform_phase_calibration() end

    return true;
  }

  getVcselPulsePeriod(type) {
    if (type == VcselPeriodPreRange)
    {
      return decodeVcselPeriod(this.readReg(PRE_RANGE_CONFIG_VCSEL_PERIOD));
    }
    else if (type == VcselPeriodFinalRange)
    {
      return decodeVcselPeriod(this.readReg(FINAL_RANGE_CONFIG_VCSEL_PERIOD));
    }
    else { return 255; }
  }

  startContinuous(period_ms) {
    this.writeReg(0x80, 0x01);
    this.writeReg(0xFF, 0x01);
    this.writeReg(0x00, 0x00);
    this.writeReg(0x91, this.stop_variable);
    this.writeReg(0x00, 0x01);
    this.writeReg(0xFF, 0x00);
    this.writeReg(0x80, 0x00);

    if (period_ms)
    {
      // continuous timed mode

      // VL53L0X_SetInterMeasurementPeriodMilliSeconds() begin

      let osc_calibrate_val = this.readReg16Bit(OSC_CALIBRATE_VAL);

      if (osc_calibrate_val != 0)
      {
        period_ms *= osc_calibrate_val;
      }

      this.writeReg32Bit(SYSTEM_INTERMEASUREMENT_PERIOD, period_ms);

      // VL53L0X_SetInterMeasurementPeriodMilliSeconds() end

      this.writeReg(SYSRANGE_START, 0x04); // VL53L0X_REG_SYSRANGE_MODE_TIMED
    }
    else
    {
      // continuous back-to-back mode
      this.writeReg(SYSRANGE_START, 0x02); // VL53L0X_REG_SYSRANGE_MODE_BACKTOBACK
    }
  }

  // Stop continuous measurements
  // based on VL53L0X_StopMeasurement()
  stopContinuous() {
    this.writeReg(SYSRANGE_START, 0x01); // VL53L0X_REG_SYSRANGE_MODE_SINGLESHOT

    this.writeReg(0xFF, 0x01);
    this.writeReg(0x00, 0x00);
    this.writeReg(0x91, 0x00);
    this.writeReg(0x00, 0x01);
    this.writeReg(0xFF, 0x00);
  }

  // Returns a range reading in millimeters when continuous mode is active
  // (readRangeSingleMillimeters() also calls this function after starting a
  // single-shot range measurement)
  async readRangeContinuousMillimeters() {
    this.startTimeout();
    while ((this.readReg(RESULT_INTERRUPT_STATUS) & 0x07) == 0)
    {
      if (this.checkTimeoutExpired())
      {
        this.did_timeout = true;
        return 65535;
      }
      //await nextTick();
    }

    // assumptions: Linearity Corrective Gain is 1000 (default);
    // fractional ranging is not enabled
    let range = this.readReg16Bit(RESULT_RANGE_STATUS + 10);

    this.writeReg(SYSTEM_INTERRUPT_CLEAR, 0x01);

    return range;
  }

  // Performs a single-shot range measurement and returns the reading in
  // millimeters
  // based on VL53L0X_PerformSingleRangingMeasurement()
  async readRangeSingleMillimeters() {
    this.writeReg(0x80, 0x01);
    this.writeReg(0xFF, 0x01);
    this.writeReg(0x00, 0x00);
    this.writeReg(0x91, this.stop_variable);
    this.writeReg(0x00, 0x01);
    this.writeReg(0xFF, 0x00);
    this.writeReg(0x80, 0x00);

    this.writeReg(SYSRANGE_START, 0x01);

    // "Wait until start bit has been cleared"
    this.startTimeout();
    while (this.readReg(SYSRANGE_START) & 0x01)
    {
      if (this.checkTimeoutExpired())
      {
        this.did_timeout = true;
        return 65535;
      }
      await nextTick();
    }

    return await this.readRangeContinuousMillimeters();
  }

  // Did a timeout occur in one of the read functions since the last call to
  // timeoutOccurred()?
  timeoutOccurred() {
    const tmp = this.did_timeout;
    this.did_timeout = false;
    return tmp;
  }

  // Private Methods /////////////////////////////////////////////////////////////

  // Get reference SPAD (single photon avalanche diode) count and type
  // based on VL53L0X_get_info_from_device(),
  // but only gets reference SPAD count and type
  async getSpadInfo(spadInfo) {
    let tmp;

    this.writeReg(0x80, 0x01);
    this.writeReg(0xFF, 0x01);
    this.writeReg(0x00, 0x00);

    this.writeReg(0xFF, 0x06);
    this.writeReg(0x83, this.readReg(0x83) | 0x04);
    this.writeReg(0xFF, 0x07);
    this.writeReg(0x81, 0x01);

    this.writeReg(0x80, 0x01);

    this.writeReg(0x94, 0x6b);
    this.writeReg(0x83, 0x00);
    this.startTimeout();
    while (this.readReg(0x83) == 0x00)
    {
      if (this.checkTimeoutExpired()) { return false; }
      await nextTick();
    }
    this.writeReg(0x83, 0x01);
    tmp = this.readReg(0x92);

    spadInfo.count = tmp & 0x7f;
    spadInfo.type_is_aperture = (tmp >> 7) & 0x01;

    this.writeReg(0x81, 0x00);
    this.writeReg(0xFF, 0x06);
    this.writeReg(0x83, this.readReg(0x83)  & ~0x04);
    this.writeReg(0xFF, 0x01);
    this.writeReg(0x00, 0x01);

    this.writeReg(0xFF, 0x00);
    this.writeReg(0x80, 0x00);

    return true;
  }

  // Get sequence step enables
  // based on VL53L0X_GetSequenceStepEnables()
  getSequenceStepEnables(enables) {
    let sequence_config = this.readReg(SYSTEM_SEQUENCE_CONFIG);

    enables.tcc          = (sequence_config >> 4) & 0x1;
    enables.dss          = (sequence_config >> 3) & 0x1;
    enables.msrc         = (sequence_config >> 2) & 0x1;
    enables.pre_range    = (sequence_config >> 6) & 0x1;
    enables.final_range  = (sequence_config >> 7) & 0x1;
  }

  // Get sequence step timeouts
  // based on get_sequence_step_timeout(),
  // but gets all timeouts instead of just the requested one, and also stores
  // intermediate values
  getSequenceStepTimeouts(enables, timeouts) {
    timeouts.pre_range_vcsel_period_pclks = this.getVcselPulsePeriod(VcselPeriodPreRange);

    timeouts.msrc_dss_tcc_mclks = this.readReg(MSRC_CONFIG_TIMEOUT_MACROP) + 1;
    timeouts.msrc_dss_tcc_us =
      this.timeoutMclksToMicroseconds(timeouts.msrc_dss_tcc_mclks,
                                timeouts.pre_range_vcsel_period_pclks);

    timeouts.pre_range_mclks =
      this.decodeTimeout(this.readReg16Bit(PRE_RANGE_CONFIG_TIMEOUT_MACROP_HI));
    timeouts.pre_range_us =
      this.timeoutMclksToMicroseconds(timeouts.pre_range_mclks,
                                timeouts.pre_range_vcsel_period_pclks);

    timeouts.final_range_vcsel_period_pclks = this.getVcselPulsePeriod(VcselPeriodFinalRange);

    timeouts.final_range_mclks =
      this.decodeTimeout(this.readReg16Bit(FINAL_RANGE_CONFIG_TIMEOUT_MACROP_HI));

    if (enables.pre_range)
    {
      timeouts.final_range_mclks -= timeouts.pre_range_mclks;
    }

    timeouts.final_range_us =
      this.timeoutMclksToMicroseconds(timeouts.final_range_mclks,
                                timeouts.final_range_vcsel_period_pclks);
  }

  // Decode sequence step timeout in MCLKs from register value
  // based on VL53L0X_decode_timeout()
  // Note: the original function returned a uint32_t, but the return value is
  // always stored in a uint16_t.
  decodeTimeout(reg_val) {
    // format: "(LSByte * 2^MSByte) + 1"
    return ((reg_val & 0x00FF) << ((reg_val & 0xFF00) >> 8)) + 1;
  }

  // Encode sequence step timeout register value from timeout in MCLKs
  // based on VL53L0X_encode_timeout()
  encodeTimeout(timeout_mclks) {
    // format: "(LSByte * 2^MSByte) + 1"

    let ls_byte = 0;
    let ms_byte = 0;

    if (timeout_mclks > 0)
    {
      ls_byte = timeout_mclks - 1;

      while ((ls_byte & 0xFFFFFF00) > 0)
      {
        ls_byte >>= 1;
        ms_byte++;
      }

      return (ms_byte << 8) | (ls_byte & 0xFF);
    }
    else { return 0; }
  }

  // Convert sequence step timeout from MCLKs to microseconds with given VCSEL period in PCLKs
  // based on VL53L0X_calc_timeout_us()
  timeoutMclksToMicroseconds(timeout_period_mclks, vcsel_period_pclks) {
    let macro_period_ns = calcMacroPeriod(vcsel_period_pclks);

    return parseInt(((timeout_period_mclks * macro_period_ns) + 500) / 1000);
  }

  // Convert sequence step timeout from microseconds to MCLKs with given VCSEL period in PCLKs
  // based on VL53L0X_calc_timeout_mclks()
  timeoutMicrosecondsToMclks(timeout_period_us, vcsel_period_pclks) {
    let macro_period_ns = calcMacroPeriod(vcsel_period_pclks);

    return parseInt(((timeout_period_us * 1000) + (macro_period_ns / 2)) / macro_period_ns);
  }

  // based on VL53L0X_perform_single_ref_calibration()
  async performSingleRefCalibration(vhv_init_byte) {
    this.writeReg(SYSRANGE_START, 0x01 | vhv_init_byte); // VL53L0X_REG_SYSRANGE_MODE_START_STOP

    this.startTimeout();
    while ((this.readReg(RESULT_INTERRUPT_STATUS) & 0x07) == 0)
    {
      if (this.checkTimeoutExpired()) { return false; }
      await nextTick();
    }

    this.writeReg(SYSTEM_INTERRUPT_CLEAR, 0x01);

    this.writeReg(SYSRANGE_START, 0x00);

    return true;
  }

  setTimeout(timeout) {
    this.io_timeout = timeout;
  }

  getTimeout() {
    return this.io_timeout;
  }

}

VL53L0X.VcselPeriodPreRange = VcselPeriodPreRange;
VL53L0X.VcselPeriodFinalRange = VcselPeriodFinalRange;

module.exports = VL53L0X;

#!/usr/bin/env node

// @ts-check

const bytes = require('bytes');
const ms = require('pretty-ms');

process.stdin.setEncoding('utf8');

const DATE_PATTERN = /^\[0mDate: \[1m\[37m(.+)\[39m\[22m\[0m$/;
const HASH_PATTERN = /^\[0mHash: \[1m\[37m(.+)\[39m\[22m\[0m$/;
const TIME_PATTERN = /^\[0mTime: \[1m\[37m(\d+)\[39m\[22mms\[0m$/;
const TYPE_ASSETS_PATTERN = /\[1m\[33m\[(\w+)]\[39m\[22m\[1m\[32m \[rendered\]\[39m\[22m\[0m$/;
const ASSETS_ENTRY_PATTERN = /^\[0mchunk {\[1m\[33m(\w+)\[39m\[22m} \[1m\[32m(.+)\[39m\[22m \((\w+)\) (.+) \[1m\[33m\[(\w+)\]\[39m\[22m\[1m\[32m \[rendered\]\[39m\[22m\[0m$/
const ASSETS_INITIAL_WHITHOUT_DEPENDENCESI_PATTERN = /^\[0mchunk {\[1m\[33m(\w+)\[39m\[22m} \[1m\[32m(.+)\[39m\[22m \((\w+)\) (.+) \[1m\[33m\[initial\]\[39m\[22m\[1m\[32m \[rendered\]\[39m\[22m\[0m$/
const ASSETS_INITIAL_WITH_DEPENDENCIES_PATTERN = /^\[0mchunk {\[1m\[33m(\w+)\[39m\[22m} \[1m\[32m(.+)\[39m\[22m \((\w+)\) (.+) \{\[1m\[33m(\w+)\[39m\[22m\} \[1m\[33m\[initial\]\[39m\[22m\[1m\[32m \[rendered\]\[39m\[22m\[0m$$/

const parseLog = ([name, artifacts, rename, size, dependency = 'root']) => ({
  name, size: bytes.parse(size)/*, dependency*/
})

const report = {
  date: null,
  hash: '',
  duration: '',
  size: '',
  bundles: []
}

process.stdin.on('readable', () => {
  const chunk = process.stdin.read();
  if (chunk !== null) {
    const rows = chunk.split('\n').filter((row) => row)
    const [$date, $hash, $time, ...$rows] = rows;
    if (DATE_PATTERN.test($date)) {
      const [, date] = DATE_PATTERN.exec($date)
      report.date = new Date(Date.parse(date))
    }
    if (HASH_PATTERN.test($hash)) {
      const [, hash] = HASH_PATTERN.exec($hash)
      report.hash = hash
    }
    if (TIME_PATTERN.test($time)) {
      const [, duration] = TIME_PATTERN.exec($time)
      report.duration = ms(parseInt(duration, 10))
    }
    $rows.forEach(($row) => {
      if (TYPE_ASSETS_PATTERN.test($row)) {
        const [, type] = TYPE_ASSETS_PATTERN.exec($row)
        switch (type) {
          case 'entry':
            if (true) {
              const [, ...values] = ASSETS_ENTRY_PATTERN.exec($row);
              report.bundles.push(parseLog(values));
            }
            break;
          case 'initial':
            if (ASSETS_INITIAL_WITH_DEPENDENCIES_PATTERN.test($row)) {
              const [, ...values] = ASSETS_INITIAL_WITH_DEPENDENCIES_PATTERN.exec($row);
              report.bundles.push(parseLog(values));
            } else if (ASSETS_INITIAL_WHITHOUT_DEPENDENCESI_PATTERN.test($row)) {
              const [, ...values] = ASSETS_INITIAL_WHITHOUT_DEPENDENCESI_PATTERN.exec($row);
              report.bundles.push(parseLog(values));
            } else {
              console.warn('Unsupported ouput format')
            }
            break;
          default:
            break;
        }
      }
    });
  }
});

process.stdin.on('end', () => {
  report.size = bytes(report.bundles.reduce((size, output) => {
    return size + output.size
  }, 0));
  const { bundles, ...output } = report
  process.stdout.write(JSON.stringify(output, null, 2));
});
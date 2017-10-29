#!/usr/bin/env node

// @ts-check

const bytes = require('bytes');
const ms = require('pretty-ms');

process.stdin.setEncoding('utf8');

const DATE_PATTERN = /^Date: (.+)$/;
const HASH_PATTERN = /^Hash: (.+)$/;
const TIME_PATTERN = /^Time: (\d+)ms$/;
const TYPE_ASSETS_PATTERN = /\[(\w+)] \[rendered\]$/;
const ASSETS_ENTRY_PATTERN = /^chunk {(\w+)} (.+) \((\w+)\) (.+) \[(\w+)\] \[rendered\]$/;
const ASSETS_INITIAL_WHITHOUT_DEPENDENCESI_PATTERN = /^chunk {(\w+)} (.+) \((\w+)\) (.+) \[initial\] \[rendered\]$/;
const ASSETS_INITIAL_WITH_DEPENDENCIES_PATTERN = /^chunk {(\w+)} (.+) \((\w+)\) (.+) \{(\w+)\} \[initial\] \[rendered\]$/;

const SANITIZE_PATTERN = /\[\d{1,2}m/g

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
    const rows = chunk.split('\n')
      .filter((row) => row)
      .map(row => row.replace(SANITIZE_PATTERN, ''))
      .map(row => row.replace(//, ''))
    const [$date, $hash, $time, ...$rows] = rows;
    if (DATE_PATTERN.test($date)) {
      const [, date] = DATE_PATTERN.exec($date)
      report.date = new Date(Date.parse(date))
    } else {
      console.warn('DATE_PATTERN.test($date)', $date)
    }
    if (HASH_PATTERN.test($hash)) {
      const [, hash] = HASH_PATTERN.exec($hash)
      report.hash = hash
    } else {
      console.warn('HASH_PATTERN.test($hash)', $hash)
    }
    if (TIME_PATTERN.test($time)) {
      const [, duration] = TIME_PATTERN.exec($time)
      report.duration = ms(parseInt(duration, 10))
    } else {
      console.warn('TIME_PATTERN.test($time)', $time)
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
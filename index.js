import util from 'util';
const debuglog = util.debuglog('app');
import template from 'lodash.template'
import fs from 'fs';
import parse from 'csv-parse';

let svg;
const dir = 'output';
const imageDefaults = {
  pumpkinColour: 'orange',
  eyesColour: 'black',
  mouthColour: 'black',
  topBgColour: 'green',
  bottomBgColour: 'pink',
}

const getEyeStatesByType = (typeName, gender) => {
  const eyeOptions = {
    eyesDefaultState: 'hidden',
    eyesCrossedState: 'hidden',
    eyesTriangleGirlState: 'hidden',
    eyesTriangleBoyState: 'hidden',
  }

  if (typeName === 'DEFAULT') {
    eyeOptions.eyesDefaultState = 'visible';
  }

  if (typeName === 'CROSSED') {
    eyeOptions.eyesCrossedState = 'visible';
  }

  if (typeName === 'TRIANGLE' && gender === 'GIRL') {
    eyeOptions.eyesTriangleGirlState = 'visible';
  }

  if (typeName === 'TRIANGLE' && gender !== 'GIRL') {
    eyeOptions.eyesTriangleBoyState = 'visible';
  }

  return eyeOptions;
}

const getMouthStatesByType = (typeName) => {
  const mouthOptions = {
    mouthDefaultState: 'hidden',
    mouthFangsState: 'hidden',
    mouthWideState: 'hidden',
  }

  if (typeName === 'DEFAULT') {
    mouthOptions.mouthDefaultState = 'visible';
  }

  if (typeName === 'FANGS') {
    mouthOptions.mouthFangsState = 'visible';
  }

  if (typeName === 'WIDE') {
    mouthOptions.mouthWideState = 'visible';
  }

  return mouthOptions;
}

try {
  debuglog('Reading item template');
  const templateData = fs.readFileSync('./template.svg', 'utf8');

  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }

  debuglog('Parsing pumpkin head data');
  var itemConfigs = [];
  fs.createReadStream('./pumpkin-heads.csv')
      .pipe(parse({delimiter: ',', from_line: 2}))
      .on('data', (csvrow) => {
        const eyeStates = getEyeStatesByType(csvrow[7].trim(),csvrow[9].trim());
        const mouthStates = getMouthStatesByType(csvrow[8].trim());
        const itemConfig = {
          ...eyeStates,
          ...mouthStates,
          name: csvrow[0].trim(),
          pumpkinColour: csvrow[1].trim(),
          stalkColour: csvrow[2].trim(),
          eyesColour: csvrow[3].trim(),
          mouthColour: csvrow[4].trim(),
          topBgColour: csvrow[5].trim(),
          bottomBgColour: csvrow[6].trim()
        }
        debuglog('Item config is', itemConfig);
        itemConfigs.push(itemConfig);
      })
      .on('end', () => {
        let createdItemsCount = 0;
        itemConfigs.forEach((config) => {
          const compiled = template(templateData);
          const itemConfig = {
            ...imageDefaults,
            ...config
          }
          svg = compiled(itemConfig);
          debuglog('Creating with config', itemConfig);

          fs.writeFileSync(`${dir}/${itemConfig.name}.svg`, svg);
          debuglog(`Created ${itemConfig.name}`);
          createdItemsCount++;
        });
        debuglog(`Created ${createdItemsCount} items`);
      });
} catch (err) {
  debuglog(`Error ${err}`);
}


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
  bottomBgColour: 'pink'
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
        const itemConfig = {
          name: csvrow[0].trim(),
          pumpkinColour: csvrow[1].trim(),
          eyesColour: csvrow[2].trim(),
          mouthColour: csvrow[3].trim(),
          topBgColour: csvrow[4].trim(),
          bottomBgColour: csvrow[5].trim()
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


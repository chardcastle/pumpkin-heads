import util from 'util';
const debuglog = util.debuglog('app');
import template from 'lodash.template'
import { readFileSync, writeFileSync} from 'fs';

let svg;
const imageDefaults = {
  pumpkinColour: 'orange',
  eyesColour: 'blue',
  mouthColour: 'black',
}

try {
  debuglog('Reading template file');
  const data = readFileSync('./template.svg', 'utf8')
  const compiled = template(data);
  const config = {
    ...imageDefaults,
    pumpkinColour: 'red'
  }
  debuglog('Config is', config);
  svg = compiled(config);

  writeFileSync('out.svg', svg);
  debuglog('Created SVG file');
} catch (err) {
  debuglog(`Error ${err}`);
}


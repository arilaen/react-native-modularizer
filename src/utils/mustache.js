// Copied/adapted from Electrode Native

import Mustache from 'mustache';
import fs from 'fs-extra';

// =============================================================================
// Mustache related utilities
// =============================================================================

// Mustache render using a template file
// filename: Path to the template file
// view: Mustache view to apply to the template
// returns: Rendered string output
export async function mustacheRenderUsingTemplateFile(
  filename,
  view,
) {
  const template = await fs.readFile(filename, 'utf8')
  return Mustache.render(template, view);
}

// Mustache render to an output file using a template file
// templateFilename: Path to the template file
// view: Mustache view to apply to the template
// outputFile: Path to the output file
export async function mustacheRenderToOutputFileUsingTemplateFile(
  templateFilename,
  view,
  outputFile,
) {
  const output = await mustacheRenderUsingTemplateFile(templateFilename, view);
  await fs.writeFile(outputFile || templateFilename, output, 'utf8');
  return;
}

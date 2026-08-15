import { AgnosticEvent, AgnosticOutput } from '@godlevski/agnostic-lambda/event';
import { stringifyJsonOutput, getSqliteDatabase } from '@godlevski/agnostic-lambda/helpers';
import { slidesResponseSchema, SlidesResponse, FolioSlide } from '@godlevski/schemas/controllers/slides';
import { SlideRow, TagRow } from '@godlevski/schemas/database';

// GET /api/slides — folio slides with populated area tags
// (port of v2.1 slidesController.getSlides: Slide.find().populate('tags'))
export const slidesGetController = async (event: AgnosticEvent): Promise<AgnosticOutput> => {
  const db = getSqliteDatabase(event);

  const [slideRows, tagRows] = await Promise.all([
    db.prepare('SELECT * FROM slides ORDER BY created_at').all<SlideRow>(),
    db.prepare('SELECT * FROM tags ORDER BY slide_id, position').all<TagRow>(),
  ]);

  const tagsBySlide = new Map<string, TagRow[]>();
  for (const tag of tagRows.results) {
    const list = tagsBySlide.get(tag.slide_id) || [];
    list.push(tag);
    tagsBySlide.set(tag.slide_id, list);
  }

  const data: FolioSlide[] = slideRows.results.map(row => ({
    _id: row.id,
    publicId: row.public_id,
    project: row.project,
    client: row.client,
    tools: row.tools,
    date: row.date,
    image: row.image,
    image_width: row.image_width,
    image_height: row.image_height,
    tags: (tagsBySlide.get(row.id) || []).map(tag => ({
      _id: tag.id,
      tagname: tag.tagname,
      sxp: tag.sxp,
      syp: tag.syp,
      exp: tag.exp,
      eyp: tag.eyp,
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  const json: SlidesResponse = slidesResponseSchema.parse({
    status: 'success',
    data,
  });

  return stringifyJsonOutput({
    statusCode: 200,
    headers: { 'cache-control': 'public, max-age=300' },
    json,
  });
};

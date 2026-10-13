import { isFolder, visibleSections } from './applicationNav';

const visibleUrls = (authorities: string[]) =>
  visibleSections(authorities)
    .flatMap((section) => section.items)
    .flatMap((entry) => (isFolder(entry) ? entry.items : [entry]))
    .map((entry) => entry.url);

describe('visibleSections', () => {
  it('shows the CV to anybody who may read their own CV or is CV admin', () => {
    expect(visibleUrls(['CvAuthority.READ'])).toContain('/cvs');
    expect(visibleUrls(['CvAuthority.ADMIN'])).toContain('/cvs');
    expect(visibleUrls(['CvAuthority.WRITE'])).not.toContain('/cvs');
    expect(visibleUrls([])).not.toContain('/cvs');
  });
});

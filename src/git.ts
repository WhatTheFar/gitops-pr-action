export function metaFromUrl(url: string): { owner: string; repo: string } {
  const regex = /^(?:https:\/\/github\.com\/|git@github\.com:)(?<owner>\S+)\/(?<repo>[^.]+)(?:.git)?$/;

  const match = url.match(regex);
  if (match == null) {
    throw new Error(`Can't get category from '${url}'`);
  }
  if (match.groups === undefined) {
    // this should not happen
    throw new Error(`Can't get category from '${url}'`);
  }
  return { owner: match.groups.owner, repo: match.groups.repo };
}

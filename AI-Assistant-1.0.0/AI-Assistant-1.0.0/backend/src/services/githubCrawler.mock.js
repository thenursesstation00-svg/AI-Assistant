module.exports = {
  searchRepos: async (q, opts={per_page:1,page:1}) => {
    return { total_count: 1, items: [{ full_name: 'mockowner/mockrepo', owner: { login: 'mockowner' }, name: 'mockrepo', html_url: 'https://github.com/mockowner/mockrepo', stargazers_count: 5, clone_url: 'https://github.com/mockowner/mockrepo.git', description: 'mock' }] };
  },
  getReadme: async (owner, repo) => {
    return '# Mock README\nThis is a mock readme.';
  },
  getLicense: async (owner, repo) => {
    return { license: { key: 'mit', name: 'MIT License', spdx_id: 'MIT' } };
  }
};

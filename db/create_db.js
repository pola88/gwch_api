import { loadData } from './index.js';

loadData()
  .then( () => {
    console.log('All migrated');
  });
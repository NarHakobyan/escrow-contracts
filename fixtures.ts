import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

export async function mochaGlobalSetup() {
  chai.use(chaiAsPromised);

  console.log('server started!');
}

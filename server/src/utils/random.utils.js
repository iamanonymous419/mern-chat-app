import anoverse from 'anoverse';

const ano = anoverse();

const random = () => {
  return ano.generateRandomNumber(7);
};

export default random;

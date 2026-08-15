export default () => {
  return (Date.now() + Math.random() + '').replace('.', '_');
}
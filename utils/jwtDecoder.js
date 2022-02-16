const JWT = require('jsonwebtoken');

module.exports = (body) => {
  if (!body) {
    return new Error('invalid jwtdata');
  }

  return JWT.verify(body.toString('utf8'), 'GfYywywDe37ej8xxJKJAih_gE3ttdNiVhXJK-rltPVm_p20FgbihYEdoeHcWePPoKayd3sLpXCWZtJUTVnCXz-UzqVISv0z6YyuTEaa7z2JoLlr8M9BC-GY7A_77_TK9Ak2JOY3pgPjjzZ8IHCaGMNc7zcAyCUN2agCdCmApYE-WVD3F73prRJMO-d4HuujyuIBozCif8RuorX1xX_C1N7oYEre8tV4T6aArrpoHuxZ7SqzxwMFFuXTE_dUXxA2', {
    algorithm: 'HS256',
  });
};
---
name: Public app access
description: User-defined boundary between public exploration and account-required child records.
---

A app deve poder ser usada sem login. O onboarding da primeira abertura deve ter no máximo três passos. Só deve exigir login ao tentar adicionar uma criança.

**Why:** O utilizador pediu acesso livre à app, com autenticação apenas ao adicionar uma criança.

**How to apply:** Manter a consulta de vacinas e a navegação geral disponíveis sem conta. Ao adicionar uma criança, pedir autenticação e retomar o formulário após entrar. Não expor registos privados ao terminar sessão nem retirar a proteção dos dados no servidor.

O perfil admin deve poder gerir o onboarding de forma geral, sem depender exclusivamente do superadmin.

**Why:** O utilizador pediu poderes de gestão do onboarding para o perfil admin.

**How to apply:** Não limitar esta gestão ao superadmin. Preservar o limite de três passos e o acesso público à app; alterações à apresentação não devem apagar a conclusão já guardada pelos utilizadores.

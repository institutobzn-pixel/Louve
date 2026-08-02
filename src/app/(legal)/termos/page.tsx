import type { Metadata } from "next";
import Link from "next/link";

import { LEGAL_CONTACT_EMAIL, LEGAL_ENTITY } from "@/config/legal";

export const metadata: Metadata = { title: "Termos de Uso" };

export default function TermosPage() {
  return (
    <>
      <h1>Termos de Uso</h1>
      <p>
        Estes termos regem o uso do {LEGAL_ENTITY}, plataforma de gestão para
        ministérios de louvor. Ao criar uma conta, a igreja concorda com as
        condições abaixo.
      </p>

      <h2>1. Quem usa a plataforma</h2>
      <p>
        A conta é criada por uma <strong>igreja</strong>, que passa a ser a
        responsável por ela. A igreja cadastra seus músicos, define quem tem
        acesso a quê e responde pelo uso que sua equipe faz da plataforma.
        Cada igreja enxerga somente os próprios dados.
      </p>

      <h2>2. Conteúdo enviado pela igreja</h2>
      <p>
        A igreja pode enviar e armazenar material musical: partituras, cifras,
        letras, playbacks, multitracks, guias, links e anotações. Esse conteúdo
        continua sendo da igreja — o {LEGAL_ENTITY} apenas o armazena e o exibe
        para a equipe autorizada.
      </p>
      <p>
        Ao enviar qualquer material, a igreja declara que{" "}
        <strong>
          possui os direitos ou a autorização necessária para usá-lo
        </strong>
        , inclusive quanto a direitos autorais e licenciamento aplicáveis ao uso
        em culto. O {LEGAL_ENTITY} não fornece, não licencia e não revisa
        previamente esse conteúdo.
      </p>

      <h2>3. Notificação e remoção</h2>
      <p>
        Se você é titular de direitos e entende que algum material armazenado na
        plataforma viola seus direitos, escreva para{" "}
        <a
          href={`mailto:${LEGAL_CONTACT_EMAIL}`}
          className="text-primary hover:underline"
        >
          {LEGAL_CONTACT_EMAIL}
        </a>{" "}
        indicando o material e a titularidade alegada. Conteúdo apontado como
        irregular pode ser <strong>removido ou suspenso</strong>, e a igreja
        responsável será informada para se manifestar.
      </p>

      <h2>4. Uso aceitável</h2>
      <ul>
        <li>
          Não use a plataforma para armazenar ou distribuir material ilícito, ou
          sobre o qual a igreja não tenha direito.
        </li>
        <li>
          Não tente acessar dados de outra igreja, nem contornar os controles de
          acesso.
        </li>
        <li>
          Não compartilhe credenciais de acesso com pessoas fora da equipe
          autorizada.
        </li>
      </ul>

      <h2>5. Disponibilidade</h2>
      <p>
        Trabalhamos para manter a plataforma no ar, mas ela é oferecida{" "}
        <strong>no estado em que se encontra</strong>, sem garantia de
        funcionamento ininterrupto. Podem ocorrer interrupções por manutenção,
        falha de serviços de terceiros ou motivos fora do nosso controle.
      </p>
      <p>
        Recomendamos que a igreja mantenha cópias próprias dos arquivos
        importantes.
      </p>

      <h2>6. Encerramento</h2>
      <p>
        A igreja pode encerrar a conta quando quiser, solicitando pelo e-mail de
        contato. Podemos suspender contas que descumpram estes termos. Em caso
        de encerramento, os dados podem ser excluídos após o período necessário
        para atender obrigações legais.
      </p>

      <h2>7. Alterações</h2>
      <p>
        Estes termos podem ser atualizados. Mudanças relevantes serão informadas
        na plataforma, e o uso continuado após o aviso indica concordância.
      </p>

      <h2>8. Contato</h2>
      <p>
        Dúvidas sobre estes termos:{" "}
        <a
          href={`mailto:${LEGAL_CONTACT_EMAIL}`}
          className="text-primary hover:underline"
        >
          {LEGAL_CONTACT_EMAIL}
        </a>
        . Sobre dados pessoais, veja também a{" "}
        <Link href="/privacidade" className="text-primary hover:underline">
          Política de Privacidade
        </Link>
        .
      </p>
    </>
  );
}

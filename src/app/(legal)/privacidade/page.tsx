import type { Metadata } from "next";
import Link from "next/link";

import { LEGAL_CONTACT_EMAIL, LEGAL_ENTITY } from "@/config/legal";

export const metadata: Metadata = { title: "Política de Privacidade" };

export default function PrivacidadePage() {
  return (
    <>
      <h1>Política de Privacidade</h1>
      <p>
        Esta política explica quais dados pessoais o {LEGAL_ENTITY} trata, por
        que trata e quais são os seus direitos, conforme a Lei Geral de Proteção
        de Dados (LGPD, Lei nº 13.709/2018).
      </p>

      <h2>1. Quem é responsável pelos dados</h2>
      <p>
        Cada <strong>igreja</strong> decide quem cadastrar e para que usar a
        plataforma — ela é a <strong>controladora</strong> dos dados da sua
        equipe. O {LEGAL_ENTITY} atua como <strong>operador</strong>, tratando
        esses dados conforme a finalidade do serviço.
      </p>
      <p>
        Se você é músico de uma equipe e quer saber por que seus dados estão
        aqui, fale primeiro com a liderança da sua igreja.
      </p>

      <h2>2. Quais dados são tratados</h2>
      <ul>
        <li>
          <strong>Conta de acesso:</strong> nome, e-mail e senha (guardada de
          forma cifrada pelo serviço de autenticação).
        </li>
        <li>
          <strong>Cadastro do músico:</strong> nome, telefone, e-mail, data de
          aniversário, foto, instrumentos, nível e anotações — os campos que a
          igreja optar por preencher.
        </li>
        <li>
          <strong>Escala e disponibilidade:</strong> em quais cultos a pessoa
          foi escalada, em que função, se já visualizou a escala e os períodos
          de indisponibilidade informados.
        </li>
        <li>
          <strong>Conteúdo musical:</strong> arquivos, cifras, links e
          anotações enviados pela igreja.
        </li>
      </ul>

      <h2>3. Para que os dados são usados</h2>
      <ul>
        <li>Montar escalas e mostrar a cada músico o que é dele.</li>
        <li>Organizar o repertório e o material de ensaio.</li>
        <li>Comunicar avisos e informações do culto à equipe.</li>
        <li>Gerar relatórios internos de uso do repertório e das escalas.</li>
      </ul>
      <p>
        Não vendemos dados pessoais, não os usamos para publicidade e não os
        compartilhamos com terceiros para fins comerciais.
      </p>

      <h2>4. Microfone (afinador)</h2>
      <p>
        O afinador só liga quando você toca no botão, e o navegador pede sua
        permissão. O áudio é analisado <strong>no seu próprio aparelho</strong>,
        apenas para identificar a nota:{" "}
        <strong>nada é gravado, enviado ou armazenado</strong>. Ao parar o
        afinador ou sair da tela, o microfone é liberado.
      </p>

      <h2>5. Avisos por WhatsApp</h2>
      <p>
        O aviso de escala funciona abrindo o WhatsApp do próprio usuário com uma
        mensagem já escrita, que ele confirma e envia. O {LEGAL_ENTITY}{" "}
        <strong>não envia mensagens automaticamente</strong> e não transmite sua
        agenda de contatos a terceiros. A partir do envio, valem as políticas do
        WhatsApp.
      </p>

      <h2>6. Onde os dados ficam</h2>
      <p>
        Os dados ficam em banco PostgreSQL e os arquivos em armazenamento
        privado, ambos providos pelo <strong>Supabase</strong>, e a aplicação é
        hospedada na <strong>Vercel</strong>. Esses serviços podem manter
        servidores fora do Brasil, o que caracteriza transferência
        internacional, feita com base na execução do contrato e nas salvaguardas
        desses provedores.
      </p>
      <p>
        O acesso é isolado por igreja: além do controle na aplicação, o banco
        aplica regras de segurança por linha, de modo que uma igreja não alcance
        os dados de outra.
      </p>

      <h2>7. Cookies</h2>
      <p>
        Usamos apenas cookies necessários para manter você conectado e lembrar
        preferências de exibição. <strong>Não usamos</strong> cookies de
        publicidade nem rastreamento de terceiros.
      </p>

      <h2>8. Por quanto tempo guardamos</h2>
      <p>
        Enquanto a conta da igreja estiver ativa. Encerrada a conta, ou a pedido
        da igreja, os dados são excluídos, ressalvado o que a lei exigir manter.
      </p>

      <h2>9. Seus direitos</h2>
      <p>
        A LGPD garante a você: confirmação de que há tratamento, acesso aos
        dados, correção de dados incompletos ou desatualizados, anonimização ou
        eliminação, portabilidade, informação sobre compartilhamentos e
        revogação de consentimento.
      </p>
      <p>
        Para exercê-los, fale com a sua igreja ou escreva para{" "}
        <a
          href={`mailto:${LEGAL_CONTACT_EMAIL}`}
          className="text-primary hover:underline"
        >
          {LEGAL_CONTACT_EMAIL}
        </a>
        . Pedidos vindos de músicos são encaminhados à igreja responsável.
      </p>

      <h2>10. Segurança e incidentes</h2>
      <p>
        Adotamos medidas como acesso autenticado, isolamento por igreja,
        arquivos em armazenamento privado com links temporários e tráfego
        cifrado. Nenhum sistema é imune a falhas: havendo incidente com risco
        relevante, comunicaremos os afetados e a autoridade competente, conforme
        a lei.
      </p>

      <h2>11. Crianças e adolescentes</h2>
      <p>
        Ministérios costumam incluir menores de idade. Cabe à igreja obter o
        consentimento dos pais ou responsáveis antes de cadastrar dados de
        crianças e adolescentes, e cadastrar apenas o necessário.
      </p>

      <h2>12. Alterações</h2>
      <p>
        Esta política pode ser atualizada; mudanças relevantes serão informadas
        na plataforma. Veja também os{" "}
        <Link href="/termos" className="text-primary hover:underline">
          Termos de Uso
        </Link>
        .
      </p>
    </>
  );
}

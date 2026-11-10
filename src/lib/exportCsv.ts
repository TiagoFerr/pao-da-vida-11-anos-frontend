import { toLL, f6, setorBy, norm } from './geo';
import { CultoMarker } from '../components/map/MapSVG';

/**
 * Escapa e formata campo individual para CSV RFC 4180
 */
function q(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Gera e dispara o download do arquivo CSV com todos os cultos cadastrados
 */
export function exportCultosToCSV(cultos: CultoMarker[], filename = 'cultos-nos-lares-pao-da-vida.csv'): void {
  const headers = [
    'Setor',
    'Coordenação',
    'Bairro',
    'Rua',
    'Número',
    'Referência',
    'Líder',
    'Telefone do líder',
    'Anfitrião',
    'Telefone do anfitrião',
    'Qtd. pessoas',
    'Pessoas',
    'Horário',
    'Observações',
    'Latitude',
    'Longitude',
  ];

  const sorted = [...cultos].sort((a, b) => {
    if (a.setor !== b.setor) return a.setor - b.setor;
    return norm(a.bairro || '').localeCompare(norm(b.bairro || ''));
  });

  const rows = sorted.map((c) => {
    const [lat, lng] = toLL(c.x, c.y);
    const setorInfo = setorBy[c.setor] || {};
    const pessoas = Array.isArray(c.pessoas) ? c.pessoas : [];

    return [
      c.setor,
      setorInfo.coord || '',
      c.bairro || '',
      c.rua || '',
      c.numero || '',
      (c as any).referencia || '',
      c.lider || '',
      (c as any).liderTel || '',
      c.anfitriao || '',
      (c as any).anfTel || (c as any).telefone || '',
      pessoas.length,
      pessoas.join(', '),
      c.horario || '',
      c.obs || '',
      f6(lat),
      f6(lng),
    ]
      .map(q)
      .join(';');
  });

  // \ufeff é o Byte Order Mark (BOM) UTF-8 essencial para abrir acentos no Excel sem erro de encoding
  const csvContent = '\ufeff' + [headers.map(q).join(';'), ...rows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

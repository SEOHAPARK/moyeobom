import { useNavigate } from 'react-router-dom'

const SECTIONS = [
  {
    title: '데이터 처리 목적',
    body: [
      '본 시스템은 페스티벌 현장의 안전하고 효율적인 운영을 위해 카메라 분석 기술을 통해 집계된 혼잡도 정보만을 수집·처리합니다.',
      '개인을 식별할 수 있는 영상, 이미지, 얼굴 정보는 수집·저장·노출하지 않으며, 현장 혼잡도 산정과 관객 안내에만 활용됩니다.',
    ],
  },
  {
    title: '수집되는 정보',
    body: [
      '공연장 현재 인원 수 (카메라 분석 기반)',
      '편의시설 앞 기준 영역 점유 면적 (카메라 분석 기반)',
      '혼잡도 산정 시각 및 갱신 이력',
    ],
  },
  {
    title: '수집되지 않는 정보',
    body: [
      '개인 식별 정보 (이름, 연락처, 결제 정보 등)',
      '카메라 영상 및 개인 이미지',
      '개인별 이동 경로 및 행동 추적',
      '얼굴 인식 기반 정보',
    ],
  },
  {
    title: '데이터 보호 방법',
    body: [
      '카메라 분석은 현장에서만 수행되며, 개인 식별 불가능한 집계 수치만 서버로 전송됩니다.',
      '저장된 혼잡도 데이터는 암호화되어 관리되며, 권한이 있는 관리자만 접근 가능합니다.',
      '데이터는 페스티벌 행사 기간 종료 후 안내된 보관 기간에 따라 삭제됩니다.',
    ],
  },
  {
    title: '관객 화면 정책',
    body: [
      '관객 앱과 웹의 지도 및 상세 정보 화면에는 혼잡도 상태(여유·보통·혼잡·입장 불가) 표시와 최종 갱신 시각만 노출됩니다.',
      '개인을 식별할 수 있는 정보나 카메라 영상은 어떤 화면에도 표시되지 않습니다.',
    ],
  },
  {
    title: '관리자 화면 정책',
    body: [
      '관리자 웹은 집계된 혼잡도 수치, 산정 시각, 변경 이력만 표시합니다.',
      '카메라 영상 재생, 개인 정보 검색, 이동 경로 조회 기능은 제공되지 않습니다.',
    ],
  },
  {
    title: '문의 및 권리 보호',
    body: [
      '개인정보 처리에 대한 문의: support@festival.com',
      '개인정보 열람·수정·삭제 요청은 운영자 연락처로 접수하시기 바랍니다.',
      '자세한 개인정보 처리 방침은 페스티벌 웹사이트 하단에서 확인할 수 있습니다.',
    ],
  },
]

export default function AdminPrivacyPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <h1 className="text-lg font-bold text-gray-900">개인정보 보호 안내</h1>

      {SECTIONS.map(s => (
        <div key={s.title} className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="font-bold text-gray-800 mb-2">{s.title}</p>
          <div className="flex flex-col gap-1.5 text-sm text-gray-600">
            {s.body.map(line => <p key={line}>{line}</p>)}
          </div>
        </div>
      ))}

      <div className="flex justify-end gap-2">
        <button onClick={() => navigate(-1)} className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700">
          취소
        </button>
        <button onClick={() => navigate('/admin')} className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-semibold">
          확인 및 닫기
        </button>
      </div>
    </div>
  )
}

# 입장 악기 소스

**VS Chamber Orchestra 2: Community Edition (VSCO 2 CE)**, Versilian Studios.
Recorded by **Sam Gossner & Simon Dalzell (Ivy Audio)**; sample cutting by **Elan Hickler / Soundemote**.

- 원본: https://github.com/sgossner/VSCO-2-CE
- 프로젝트: http://vis.versilstudios.net/vsco-community.html
- 사용한 원본 커밋: `440300901dfe9275fd84e0b7763af1f8443ae62e`
- 라이선스: **CC0 1.0 Universal**. 원문의 `LICENSE`와 `Readme.txt`를 각각 `VSCO-CC0.txt`, `VSCO-README.txt`로 보존했다.
- 파일 취득·SHA-256 검사·가공: 저장소 `_build/entry-audio.py`. 브라우저에서는 외부 음원 서비스에 요청하지 않는다.

| 배포 파일 | 원본 경로 | 가공 후 음정 |
|---|---|---|
| violin.mp3 | Strings/Solo Violin/Arco Vib/LLVln_ArcoVib_A4_p.wav | A4, 약한 활·비브라토 |
| cello.mp3 | Strings/Cello Section/susvib/susvib_D2_v1_1.wav | D3, 첼로 섹션 |
| flute.mp3 | Woodwinds/Flute/susNV/LDFlute_susNV_E4_v1_1.wav | E5, 비브라토 없는 지속음 |
| piano-d.mp3 | Keys/Upright Piano/Player_dyn2_rr1_026.wav | C♯5 → D5 |

VSCO 파일명의 옥타브 표기는 악기마다 다르므로 위 표는 실제 녹음의 주파수와 피아노 원본 MappingChart를 기준으로 적었다.

원본에서 첫 4초를 사용하고, 45 Hz 고역 통과·11 kHz 저역 통과·음량 정리·끝단 페이드를 적용해 44.1 kHz / 128 kbps MP3로 변환했다. 피아노 D5는 원음 C♯5에서 반음 올렸다. 악기 자체의 녹음 질감을 유지하며, 재생 시 원음과 별도의 스테레오 홀 잔향을 섞는다. 시작 음표 클릭 때 피아노 D5를 한 번 재생한다. 1.5초 뒤부터 바이올린 A4·피아노 D5·첼로 D3·플루트 E5를 각 음표의 등장과 함께 재생한다. 이후 간격은 1.2 → 0.9 → 0.6 → 0.45초로 줄어들며 합주로 이어진다. 마지막에는 네 음을 정확히 동시에 울린다. 합주는 피아노 어택과 첼로 저음의 무게, 좌우 공간을 강조하고 3.2초 동안 재생하며 마지막 2.2초를 부드럽게 감쇠한다. 의도한 어택은 총 9번이며 피아노 아르페지오는 없다. 0.26/0.52초 에코는 원음의 작은 반사음으로, 샘플을 다시 트리거하지 않는다. 곡선 감쇠와 2.6초 홀 잔향을 적용하며, 정상 입장 뒤 마지막 잔향은 1.6초 동안 자연스럽게 줄인다.

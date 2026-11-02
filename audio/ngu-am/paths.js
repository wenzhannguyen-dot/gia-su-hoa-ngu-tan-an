/* MP3 vận mẫu và thanh mẫu; giữ nguyên tên gốc. */
(function () {
 const names = new Set('a ai an ang ao b c ch d e ei en eng er f g h i ia ian iang iao ie in ing iong iu j k l m n o ong ou p q r s sh t u ua uai uan uang uen ueng ui uo x z zh ü üan üe ün'.split(' '));
 const aliases = {iou:'iu',uei:'ui',un:'uen',ue:'üe'};
 window.resolvePhoneticMP3 = function(value) {
  const raw=String(value).normalize('NFC');
  const key=raw.toLowerCase().endsWith('.mp3')?raw.slice(0,-4):raw;
  const name=aliases[key]||key;
  return names.has(name)?'audio/ngu-am/'+encodeURIComponent(name)+'.mp3':encodeURIComponent(key)+'.mp3';
 };
})();

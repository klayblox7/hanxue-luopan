"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { assetPath } from "@/data/assetPath";
import { getAdmissionCaseSummary, type DistributionItem } from "@/data/admissionCases";
import { koreaMapRegions, type KoreaMapRegionKey, type KoreaMapRegionShape } from "@/data/korea-map-regions";
import { universityAddresses } from "@/data/universityAddresses";
import { universityTuitionsRmb } from "@/data/universityTuitions";
import { getUniversityTier } from "@/data/universityTiers";
import { universities, type University } from "@/data/universities";

type RegionKey = KoreaMapRegionKey;

type CityCoordinate = {
  lon: number;
  lat: number;
};

type RegionProfile = KoreaMapRegionShape;

type SchoolMarker = {
  school: University;
  regionKey: RegionKey;
  x: number;
  y: number;
};

type MarkerCallout = {
  labelX: number;
  labelY: number;
  anchor: "start" | "end";
};

const mapBounds = {
  minLon: 124.85,
  maxLon: 131.25,
  minLat: 33.0,
  maxLat: 38.75
};

const cityCoordinates: Record<string, CityCoordinate> = {
  "首尔": { lon: 126.978, lat: 37.5665 },
  "水原": { lon: 127.0286, lat: 37.2636 },
  "安城": { lon: 127.2798, lat: 37.008 },
  "安东": { lon: 128.7294, lat: 36.5684 },
  "安山": { lon: 126.8309, lat: 37.3219 },
  "抱川": { lon: 127.2003, lat: 37.8949 },
  "龙仁": { lon: 127.177, lat: 37.2411 },
  "城南": { lon: 127.1378, lat: 37.42 },
  "昌原": { lon: 128.6811, lat: 35.2281 },
  "金海": { lon: 128.8811, lat: 35.2342 },
  "富川": { lon: 126.766, lat: 37.503 },
  "高阳": { lon: 126.831, lat: 37.658 },
  "高城": { lon: 128.4676, lat: 38.3806 },
  "公州": { lon: 127.119, lat: 36.4467 },
  "仁川": { lon: 126.7052, lat: 37.4563 },
  "军浦": { lon: 126.9352, lat: 37.3617 },
  "锦山": { lon: 127.4889, lat: 36.1089 },
  "大田": { lon: 127.3845, lat: 36.3504 },
  "世宗": { lon: 127.289, lat: 36.4801 },
  "清州": { lon: 127.489, lat: 36.6424 },
  "天安": { lon: 127.1522, lat: 36.8151 },
  "牙山": { lon: 126.978, lat: 36.7898 },
  "礼山": { lon: 126.8447, lat: 36.6826 },
  "论山": { lon: 127.0987, lat: 36.1872 },
  "罗州": { lon: 126.7108, lat: 35.0159 },
  "春川": { lon: 127.7298, lat: 37.8813 },
  "东豆川": { lon: 127.0607, lat: 37.9037 },
  "釜山": { lon: 129.0756, lat: 35.1796 },
  "大邱": { lon: 128.6014, lat: 35.8714 },
  "光州": { lon: 126.8526, lat: 35.1595 },
  "蔚山": { lon: 129.3114, lat: 35.5384 },
  "全州": { lon: 127.148, lat: 35.8242 },
  "镇川": { lon: 127.4407, lat: 36.8554 },
  "庆山": { lon: 128.7415, lat: 35.8251 },
  "庆州": { lon: 129.2247, lat: 35.8562 },
  "龟尾": { lon: 128.3446, lat: 36.1195 },
  "群山": { lon: 126.7368, lat: 35.9677 },
  "华城": { lon: 126.8312, lat: 37.1995 },
  "浦项": { lon: 129.365, lat: 36.019 },
  "益山": { lon: 126.9576, lat: 35.9483 },
  "议政府": { lon: 127.0474, lat: 37.7381 },
  "杨州": { lon: 127.0458, lat: 37.7853 },
  "原州": { lon: 127.9202, lat: 37.3422 },
  "完州": { lon: 127.1621, lat: 35.9047 },
  "顺天": { lon: 127.4872, lat: 34.9506 },
  "济州": { lon: 126.5312, lat: 33.4996 },
  "ERICA": { lon: 126.8312, lat: 37.3219 }
};

const schoolCoordinates: Record<string, CityCoordinate> = {
  "ajou-university": { lon: 127.0453782, lat: 37.2830024 },
  "catholic-university-of-korea": { lon: 126.8010856, lat: 37.4866889 },
  "cheongju-university": { lon: 127.4994307, lat: 36.6600782 },
  "chonnam-national-university": { lon: 126.9068927, lat: 35.1769099 },
  "chung-ang-university": { lon: 126.9570000, lat: 37.5051000 },
  "chungbuk-national-university": { lon: 127.4538403, lat: 36.6281688 },
  "chungnam-national-university": { lon: 127.3448387, lat: 36.3698790 },
  "dankook-university": { lon: 127.1289665, lat: 37.3192880 },
  "dong-a-university": { lon: 128.9672222, lat: 35.1163889 },
  "dongguk-university": { lon: 126.9994886, lat: 37.5582383 },
  "duksung-womens-university": { lon: 127.0166691, lat: 37.6513775 },
  "ewha-womans-university": { lon: 126.9468925, lat: 37.5643371 },
  "gachon-university": { lon: 127.1337775, lat: 37.4527980 },
  "handong-global-university": { lon: 129.3886111, lat: 36.1031270 },
  "hankuk-university-of-foreign-studies": { lon: 127.0598000, lat: 37.5973000 },
  "hansei-university": { lon: 126.9537350, lat: 37.3440950 },
  "hanyang-university": { lon: 127.0470893, lat: 37.5569876 },
  "hongik-university": { lon: 126.9254349, lat: 37.5503552 },
  "inha-university": { lon: 126.6534446, lat: 37.4494431 },
  "inje-university": { lon: 128.9020135, lat: 35.2500610 },
  "jeju-national-university": { lon: 126.5619516, lat: 33.4551212 },
  "jeonbuk-national-university": { lon: 127.1337209, lat: 35.8466752 },
  "kaist": { lon: 127.3625250, lat: 36.3696991 },
  "kangwon-national-university": { lon: 127.7447487, lat: 37.8672582 },
  "keimyung-university": { lon: 128.4849417, lat: 35.8567134 },
  "konkuk-university": { lon: 127.0771149, lat: 37.5418470 },
  "kookmin-university": { lon: 126.9964154, lat: 37.6114792 },
  "korea-aerospace-university": { lon: 126.8653933, lat: 37.6003073 },
  "korea-maritime-ocean-university": { lon: 129.0891449, lat: 35.0761704 },
  "korea-national-university-of-arts": { lon: 127.0568000, lat: 37.6040000 },
  "korea-university": { lon: 127.0323927, lat: 37.5880378 },
  "kwangwoon-university": { lon: 127.0597566, lat: 37.6197648 },
  "kyung-hee-university": { lon: 127.0519867, lat: 37.5971213 },
  "kyungpook-national-university": { lon: 128.6108553, lat: 35.8905697 },
  "myongji-university": { lon: 126.9227731, lat: 37.5796109 },
  "partner-ffg-k34-hlz-i1y": { lon: 126.7188837, lat: 35.0491912 },
  "partner-ffg-r5r-hlz-i1y": { lon: 129.0100780, lat: 35.1445519 },
  "partner-ffx-smg-hlz-i1y": { lon: 127.4489726, lat: 36.1923189 },
  "partner-fjg-ffg-hlz-i1y": { lon: 127.0705118, lat: 37.8107535 },
  "partner-fjg-n7j-hlz-i1y": { lon: 127.0365609, lat: 37.3013910 },
  "partner-fs1-u09-hlz-i1y": { lon: 127.0445209, lat: 37.7090404 },
  "partner-g21-iji-ho3-i1c-hlz-i1y": { lon: 126.7974759, lat: 35.1636239 },
  "partner-g2w-iji-hlz-i1y": { lon: 127.0895180, lat: 35.8127648 },
  "partner-g30-iji-h6l-o97-hlz-i1y": { lon: 127.1401671, lat: 36.4682808 },
  "partner-g30-iji-hlz-i1y": { lon: 127.1401671, lat: 36.4682808 },
  "partner-ggn-smg-hlz-i1y": { lon: 126.8402985, lat: 35.2064503 },
  "partner-gjs-kfy-hlz-i1y": { lon: 127.4529350, lat: 36.3352732 },
  "partner-gjs-noz-hlz-i1y": { lon: 127.0659136, lat: 35.9121128 },
  "partner-glo-iwn-ho3-i1c-hlz-i1y": { lon: 127.0435000, lat: 37.6068000 },
  "partner-hdl-keo-hlz-i1y": { lon: 127.3662000, lat: 36.3206000 },
  "partner-hlz-n5c-hlz-i1y": { lon: 127.4603521, lat: 36.3354252 },
  "partner-hlz-nj3-hlz-i1y": { lon: 127.1564210, lat: 37.8717581 },
  "partner-hlz-skx-hlz-i1y": { lon: 128.8471795, lat: 35.9025671 },
  "partner-i2x-ffg-hlz-i1y": { lon: 128.7963000, lat: 36.5424000 },
  "partner-io6-feo-hlz-i1y": { lon: 128.8011067, lat: 35.9077641 },
  "partner-io6-fip-hlz-i1y": { lon: 128.4669655, lat: 36.1676137 },
  "partner-io6-ggn-hlz-i1y": { lon: 128.5531977, lat: 35.1815818 },
  "partner-io6-iji-hlz-i1y": { lon: 129.1617152, lat: 35.8296967 },
  "partner-io6-k67-hlz-i1y": { lon: 129.0980524, lat: 35.1406608 },
  "partner-ire-to3-hlz-i1y": { lon: 127.1105990, lat: 36.1823158 },
  "partner-k34-p5j-hlz-i1y": { lon: 128.9972808, lat: 35.1672024 },
  "partner-kd9-uxo-hlz-i1y": { lon: 126.9303491, lat: 35.1412134 },
  "partner-kfy-lu8-hlz-i1y": { lon: 126.8744808, lat: 35.1085836 },
  "partner-ldg-gin-hlz-i1y": { lon: 126.9757751, lat: 37.2100359 },
  "partner-ldk-sez-ff7-tm0-hlz-i1y": { lon: 128.6219329, lat: 35.8959778 },
  "partner-lla-iji-r7m-g21-hlz-i1y": { lon: 126.4346020, lat: 33.4483838 },
  "partner-lsm-ggn-hlz-i1y": { lon: 126.7600432, lat: 35.1515516 },
  "partner-mlj-h65-hlz-i1y": { lon: 127.3390860, lat: 36.3246693 },
  "partner-nel-noz-hlz-i1y": { lon: 127.1850643, lat: 36.8397504 },
  "partner-nem-lla-pru-kdr-hlz-i1y": { lon: 127.1264399, lat: 35.9955466 },
  "partner-p7o-i9d-hlz-i1y": { lon: 126.6802365, lat: 35.9456011 },
  "partner-r5r-fjg-hlz-i1y": { lon: 127.0128587, lat: 37.6149469 },
  "partner-st8-i9d-hli-h6l-rn1-hlz-i1y": { lon: 129.0795592, lat: 35.2670628 },
  "partner-u4a-hm1-hlz-i1y": { lon: 127.4794081, lat: 34.9696591 },
  "partner-uc6-i6s-p30-glk-pru-kdr-hlz-i1y": { lon: 127.0280000, lat: 37.4875000 },
  "partner-uc6-i6s-pru-kdr-hlz-i1y": { lon: 126.8371411, lat: 37.3332253 },
  "partner-ul4-fgd-1v-3d-2q-2t-36-hlz-i1y": { lon: 126.9860000, lat: 37.5770000 },
  "partner-vix-fk1-hlz-i1y": { lon: 127.1677464, lat: 37.2263944 },
  "pukyong-national-university": { lon: 129.1052466, lat: 35.1342725 },
  "pusan-national-university": { lon: 129.0784068, lat: 35.2343498 },
  "sangmyung-university": { lon: 126.9548314, lat: 37.6025021 },
  "sejong-university": { lon: 127.0746074, lat: 37.5508480 },
  "seoul-national-university": { lon: 126.9527000, lat: 37.4599000 },
  "seoul-womens-university": { lon: 127.0905308, lat: 37.6282981 },
  "seoultech": { lon: 127.0794648, lat: 37.6324414 },
  "sogang-university": { lon: 126.9409875, lat: 37.5520909 },
  "sookmyung-womens-university": { lon: 126.9652336, lat: 37.5442933 },
  "soonchunhyang-university": { lon: 126.9316341, lat: 36.7699880 },
  "soongsil-university": { lon: 126.9567202, lat: 37.4962989 },
  "sungkyunkwan-university": { lon: 126.9906264, lat: 37.5870459 },
  "sungshin-womens-university": { lon: 127.0222074, lat: 37.5913559 },
  "university-of-seoul": { lon: 127.0591856, lat: 37.5830387 },
  "university-of-ulsan": { lon: 129.2567134, lat: 35.5442371 },
  "wonkwang-university": { lon: 126.9591018, lat: 35.9687790 },
  "yeungnam-university": { lon: 128.7572223, lat: 35.8280220 },
  "yonsei-university": { lon: 126.9368000, lat: 37.5658000 }
};

const regions: RegionProfile[] = koreaMapRegions;

const schoolImageBySlug: Record<string, string> = {
  "ajou-university": "/campus-images/ajou-university.jpg",
  "catholic-university-of-korea": "/campus-images/catholic-university-of-korea.jpg",
  "cheongju-university": "/campus-images/cheongju-university.webp",
  "chonnam-national-university": "/campus-images/chonnam-national-university.png",
  "chung-ang-university": "/campus-images/chung-ang-university.webp",
  "chungbuk-national-university": "/campus-images/chungbuk-national-university.webp",
  "chungnam-national-university": "/campus-images/chungnam-national-university.jpg",
  "dankook-university": "/campus-images/dankook-university.webp",
  "dong-a-university": "/campus-images/dong-a-university.jpg",
  "dongguk-university": "/campus-images/dongguk-university.webp",
  "duksung-womens-university": "/campus-images/duksung-womens-university.jpg",
  "ewha-womans-university": "/campus-images/ewha-womans-university.webp",
  "gachon-university": "/campus-images/gachon-university.webp",
  "handong-global-university": "/campus-images/handong-global-university.jpg",
  "hankuk-university-of-foreign-studies": "/campus-images/hankuk-university-of-foreign-studies.jpg",
  "hansei-university": "/campus-images/hansei-university.webp",
  "hanyang-university": "/campus-images/hanyang-university.webp",
  "hongik-university": "/campus-images/hongik-university.webp",
  "inha-university": "/campus-images/inha-university.webp",
  "inje-university": "/campus-images/inje-university.jpg",
  "jeju-national-university": "/campus-images/jeju-national-university.jpg",
  "jeonbuk-national-university": "/campus-images/jeonbuk-national-university.webp",
  "kaist": "/campus-images/kaist.jpg",
  "kangwon-national-university": "/campus-images/kangwon-national-university.webp",
  "keimyung-university": "/campus-images/keimyung-university.jpg",
  "konkuk-university": "/campus-images/konkuk-university.webp",
  "kookmin-university": "/campus-images/kookmin-university.jpg",
  "korea-aerospace-university": "/campus-images/korea-aerospace-university.webp",
  "korea-maritime-ocean-university": "/campus-images/korea-maritime-ocean-university.png",
  "korea-national-university-of-arts": "/campus-images/korea-national-university-of-arts.jpg",
  "korea-university": "/campus-images/korea-university.webp",
  "kwangwoon-university": "/campus-images/kwangwoon-university.webp",
  "kyung-hee-university": "/campus-images/kyung-hee-university.webp",
  "kyungpook-national-university": "/campus-images/kyungpook-national-university.jpg",
  "myongji-university": "/campus-images/myongji-university.webp",
  "partner-ffg-k34-hlz-i1y": "/campus-images/partner-ffg-k34-hlz-i1y.webp",
  "partner-ffg-r5r-hlz-i1y": "/campus-images/partner-ffg-r5r-hlz-i1y.webp",
  "partner-ffx-smg-hlz-i1y": "/campus-images/partner-ffx-smg-hlz-i1y.webp",
  "partner-fjg-ffg-hlz-i1y": "/campus-images/partner-fjg-ffg-hlz-i1y.webp",
  "partner-fjg-n7j-hlz-i1y": "/campus-images/partner-fjg-n7j-hlz-i1y.webp",
  "partner-fs1-u09-hlz-i1y": "/campus-images/partner-fs1-u09-hlz-i1y.webp",
  "partner-g21-iji-ho3-i1c-hlz-i1y": "/campus-images/partner-g21-iji-ho3-i1c-hlz-i1y.webp",
  "partner-g2w-iji-hlz-i1y": "/campus-images/partner-g2w-iji-hlz-i1y.webp",
  "partner-g30-iji-h6l-o97-hlz-i1y": "/campus-images/partner-g30-iji-h6l-o97-hlz-i1y.webp",
  "partner-g30-iji-hlz-i1y": "/campus-images/partner-g30-iji-hlz-i1y.webp",
  "partner-ggn-smg-hlz-i1y": "/campus-images/partner-ggn-smg-hlz-i1y.webp",
  "partner-gjs-kfy-hlz-i1y": "/campus-images/partner-gjs-kfy-hlz-i1y.webp",
  "partner-gjs-noz-hlz-i1y": "/campus-images/partner-gjs-noz-hlz-i1y.webp",
  "partner-glo-iwn-ho3-i1c-hlz-i1y": "/campus-images/partner-glo-iwn-ho3-i1c-hlz-i1y.webp",
  "partner-hdl-keo-hlz-i1y": "/campus-images/partner-hdl-keo-hlz-i1y.webp",
  "partner-hlz-n5c-hlz-i1y": "/campus-images/partner-hlz-n5c-hlz-i1y.webp",
  "partner-hlz-nj3-hlz-i1y": "/campus-images/partner-hlz-nj3-hlz-i1y.webp",
  "partner-hlz-skx-hlz-i1y": "/campus-images/partner-hlz-skx-hlz-i1y.webp",
  "partner-i2x-ffg-hlz-i1y": "/campus-images/partner-i2x-ffg-hlz-i1y.webp",
  "partner-io6-feo-hlz-i1y": "/campus-images/partner-io6-feo-hlz-i1y.webp",
  "partner-io6-fip-hlz-i1y": "/campus-images/partner-io6-fip-hlz-i1y.webp",
  "partner-io6-ggn-hlz-i1y": "/campus-images/partner-io6-ggn-hlz-i1y.webp",
  "partner-io6-iji-hlz-i1y": "/campus-images/partner-io6-iji-hlz-i1y.webp",
  "partner-io6-k67-hlz-i1y": "/campus-images/partner-io6-k67-hlz-i1y.webp",
  "partner-ire-to3-hlz-i1y": "/campus-images/partner-ire-to3-hlz-i1y.webp",
  "partner-k34-p5j-hlz-i1y": "/campus-images/partner-k34-p5j-hlz-i1y.webp",
  "partner-kd9-uxo-hlz-i1y": "/campus-images/partner-kd9-uxo-hlz-i1y.webp",
  "partner-kfy-lu8-hlz-i1y": "/campus-images/partner-kfy-lu8-hlz-i1y.webp",
  "partner-ldg-gin-hlz-i1y": "/campus-images/partner-ldg-gin-hlz-i1y.webp",
  "partner-ldk-sez-ff7-tm0-hlz-i1y": "/campus-images/partner-ldk-sez-ff7-tm0-hlz-i1y.webp",
  "partner-lla-iji-r7m-g21-hlz-i1y": "/campus-images/partner-lla-iji-r7m-g21-hlz-i1y.webp",
  "partner-lsm-ggn-hlz-i1y": "/campus-images/partner-lsm-ggn-hlz-i1y.webp",
  "partner-mlj-h65-hlz-i1y": "/campus-images/partner-mlj-h65-hlz-i1y.webp",
  "partner-nel-noz-hlz-i1y": "/campus-images/partner-nel-noz-hlz-i1y.webp",
  "partner-nem-lla-pru-kdr-hlz-i1y": "/campus-images/partner-nem-lla-pru-kdr-hlz-i1y.webp",
  "partner-p7o-i9d-hlz-i1y": "/campus-images/partner-p7o-i9d-hlz-i1y.webp",
  "partner-r5r-fjg-hlz-i1y": "/campus-images/partner-r5r-fjg-hlz-i1y.webp",
  "partner-st8-i9d-hli-h6l-rn1-hlz-i1y": "/campus-images/partner-st8-i9d-hli-h6l-rn1-hlz-i1y.webp",
  "partner-u4a-hm1-hlz-i1y": "/campus-images/partner-u4a-hm1-hlz-i1y.webp",
  "partner-uc6-i6s-p30-glk-pru-kdr-hlz-i1y": "/campus-images/partner-uc6-i6s-p30-glk-pru-kdr-hlz-i1y.webp",
  "partner-uc6-i6s-pru-kdr-hlz-i1y": "/campus-images/partner-uc6-i6s-pru-kdr-hlz-i1y.webp",
  "partner-ul4-fgd-1v-3d-2q-2t-36-hlz-i1y": "/campus-images/partner-ul4-fgd-1v-3d-2q-2t-36-hlz-i1y.webp",
  "partner-vix-fk1-hlz-i1y": "/campus-images/partner-vix-fk1-hlz-i1y.webp",
  "pukyong-national-university": "/campus-images/pukyong-national-university.webp",
  "pusan-national-university": "/campus-images/pusan-national-university.webp",
  "sangmyung-university": "/campus-images/sangmyung-university.webp",
  "sejong-university": "/campus-images/sejong-university.webp",
  "seoul-national-university": "/campus-images/seoul-national-university.jpg",
  "seoul-womens-university": "/campus-images/seoul-womens-university.webp",
  "seoultech": "/campus-images/seoultech.webp",
  "sogang-university": "/campus-images/sogang-university.jpg",
  "sookmyung-womens-university": "/campus-images/sookmyung-womens-university.jpg",
  "soonchunhyang-university": "/campus-images/soonchunhyang-university.jpg",
  "soongsil-university": "/campus-images/soongsil-university.webp",
  "sungkyunkwan-university": "/campus-images/sungkyunkwan-university.jpg?v=skku-20260613",
  "sungshin-womens-university": "/campus-images/sungshin-womens-university.jpg",
  "university-of-seoul": "/campus-images/university-of-seoul.jpg",
  "university-of-ulsan": "/campus-images/university-of-ulsan.jpg",
  "wonkwang-university": "/campus-images/wonkwang-university.webp",
  "yeungnam-university": "/campus-images/yeungnam-university.webp",
  "yonsei-university": "/campus-images/yonsei-university.webp"
};

const fallbackSchool = universities.find((school) => school.slug === "yonsei-university") ?? universities[0];

function primaryCity(city: string) {
  return city.split("/")[0]?.trim() || city;
}

function regionForSchool(school: University): RegionKey {
  const city = primaryCity(school.city);
  return regions.find((region) => region.cities.some((regionCity) => city.includes(regionCity)))?.key ?? "seoul";
}

function regionByKey(key: RegionKey) {
  return regions.find((region) => region.key === key) ?? regions[0];
}

function projectCoordinate(coordinate: CityCoordinate) {
  return {
    x: ((coordinate.lon - mapBounds.minLon) / (mapBounds.maxLon - mapBounds.minLon)) * 360,
    y: ((mapBounds.maxLat - coordinate.lat) / (mapBounds.maxLat - mapBounds.minLat)) * 300
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function markerOffset(index: number) {
  if (index === 0) return { x: 0, y: 0 };
  const angle = index * 2.3999632297;
  const radius = 6 + Math.sqrt(index) * 2.4;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius
  };
}

function buildMarkers(): SchoolMarker[] {
  const cityCounts = new Map<string, number>();

  return universities.map((school) => {
    const city = primaryCity(school.city);
    const previous = cityCounts.get(city) ?? 0;
    cityCounts.set(city, previous + 1);
    const regionKey = regionForSchool(school);
    const region = regionByKey(regionKey);
    const coordinate = schoolCoordinates[school.slug] ?? cityCoordinates[city] ?? cityCoordinates["首尔"];
    const projected = projectCoordinate(coordinate);
    const offset = markerOffset(previous);

    return {
      school,
      regionKey,
      x: clamp(projected.x + offset.x, region.bbox.x + 8, region.bbox.x + region.bbox.width - 8),
      y: clamp(projected.y + offset.y, region.bbox.y + 8, region.bbox.y + region.bbox.height - 8)
    };
  });
}

function schoolBySlug(slug: string) {
  return universities.find((school) => school.slug === slug) ?? fallbackSchool;
}

function schoolCityText(school: University) {
  return school.city.replace(/\//g, " / ");
}

function normalizeSchoolAddress(address: string) {
  return address.replace(/^.*?\u9053\s+/, "");
}

function schoolAddress(school: University) {
  const address = universityAddresses[school.slug] ?? `${schoolCityText(school)} 地址待补`;
  return normalizeSchoolAddress(address);
}

function fallbackRecommendedScore(school: University) {
  if (school.no <= 10) return "80分+";
  if (school.no <= 30) return "75分+";
  return "70分+";
}

function fallbackRecommendedTopik(school: University) {
  return school.type.includes("国立") ? "4级以上" : "3~4级";
}

function fallbackTuitionRange(school: University) {
  if (school.type.includes("国立") || school.type.includes("公立")) return "约 7,900~12,500 RMB/学期";
  return "约 11,500~22,000 RMB/学期";
}

function schoolTypeBadgeClass(type: string) {
  if (type.includes("私立")) return "bg-[#ffd0d8] border-[#ff6b5a]/25";
  if (type.includes("国立") || type.includes("公立")) return "bg-[#cfe8ff] border-blue-500/25";
  return "bg-[#eef8ee] border-ink/10";
}

function topikLevel(item: DistributionItem) {
  const match = item.label.match(/TOPIK\s*(\d)级/);
  return match ? Number(match[1]) : null;
}

function admissionTopikText(distribution: DistributionItem[], fallback: string) {
  const levels = distribution.map(topikLevel).filter((level): level is number => typeof level === "number");
  if (!levels.length) return fallback;

  const mainItem = distribution
    .filter((item) => topikLevel(item) !== null)
    .sort((a, b) => b.count - a.count)[0];
  const main = topikLevel(mainItem) ?? levels[0];
  const min = Math.min(...levels);
  const max = Math.max(...levels);

  return min === max ? `${main}级为主` : `${min}~${max}级（${main}级为主）`;
}

function isSpecificMajor(item: DistributionItem) {
  return !/未披露|未注明|公开案例/.test(item.label);
}

function schoolTags(school: University) {
  return school.focus.split(/、|銆/).filter(Boolean).slice(0, 4);
}

function studyInfoFacts(school: University) {
  const summary = getAdmissionCaseSummary(school.slug);
  const majors = summary.majorDistribution.filter(isSpecificMajor).slice(0, 3).map((item) => item.label);

  return {
    score: summary.admittedAverageGpa ? `录取均分 ${summary.admittedAverageGpa}分` : fallbackRecommendedScore(school),
    topik: admissionTopikText(summary.topikDistribution, fallbackRecommendedTopik(school)),
    tuition: universityTuitionsRmb[school.slug] ?? fallbackTuitionRange(school),
    tags: majors.length ? majors : schoolTags(school).slice(0, 3)
  };
}

function regionCounts(markers: SchoolMarker[]) {
  return regions.reduce<Record<RegionKey, number>>((counts, region) => {
    counts[region.key] = markers.filter((marker) => marker.regionKey === region.key).length;
    return counts;
  }, {} as Record<RegionKey, number>);
}

function tierRank(school: University) {
  return Number(getUniversityTier(school.nameCn).replace("T", "")) || 5;
}

function schoolMenuLabel(school: University) {
  return `${getUniversityTier(school.nameCn)} ${school.nameCn}`;
}

function sortMarkersByTier(markers: SchoolMarker[]) {
  return [...markers].sort((a, b) => tierRank(a.school) - tierRank(b.school) || a.school.no - b.school.no);
}

function detailTransform(region: RegionProfile) {
  const minWidth = region.key === "seoul" ? 30 : region.key === "jeju" ? 56 : 82;
  const minHeight = region.key === "seoul" ? 22 : region.key === "jeju" ? 38 : 58;
  const width = Math.max(region.bbox.width + 18, minWidth);
  const height = Math.max(region.bbox.height + 14, minHeight);
  const cx = region.bbox.x + region.bbox.width / 2;
  const cy = region.bbox.y + region.bbox.height / 2;
  const x = Math.max(0, Math.min(360 - width, cx - width / 2));
  const y = Math.max(0, Math.min(300 - height, cy - height / 2));
  const baseScale = Math.min(350 / width, 286 / height);
  const scale = baseScale * (region.key === "jeju" ? 0.8 : 1);
  const tx = (360 - width * scale) / 2 - x * scale;
  const ty = (300 - height * scale) / 2 - y * scale;
  return { scale, tx, ty };
}

function detailMarkerCallout(marker: SchoolMarker, index: number, region: RegionProfile): MarkerCallout {
  const rightSide = index % 2 === 0;
  const lane = Math.floor(index / 2);
  const labelX = rightSide ? region.bbox.x + region.bbox.width + 8 : region.bbox.x - 8;
  const labelY = clamp(region.bbox.y + 16 + lane * 13, region.bbox.y + 10, region.bbox.y + region.bbox.height - 8);

  return {
    labelX: clamp(labelX, 6, 354),
    labelY: clamp(labelY, 10, 292),
    anchor: rightSide ? "start" : "end"
  };
}

export function KoreaStudyMap() {
  const markers = useMemo(() => buildMarkers(), []);
  const counts = useMemo(() => regionCounts(markers), [markers]);
  const [activeRegionKey, setActiveRegionKey] = useState<RegionKey>("seoul");
  const [activeSchoolSlug, setActiveSchoolSlug] = useState("yonsei-university");
  const [hoveredSchoolSlug, setHoveredSchoolSlug] = useState<string | null>(null);
  const activeRegion = regionByKey(activeRegionKey);
  const activeSchool = schoolBySlug(activeSchoolSlug);
  const activeMarkers = markers.filter((marker) => marker.regionKey === activeRegionKey);
  const sortedActiveMarkers = useMemo(() => sortMarkersByTier(activeMarkers), [activeMarkers]);
  const activeMarker = markers.find((marker) => marker.school.slug === activeSchoolSlug);
  const hoveredSchool = hoveredSchoolSlug ? schoolBySlug(hoveredSchoolSlug) : null;
  const markerPreviewSchool = hoveredSchool ?? activeSchool;
  const detailRegion = activeRegion;
  const transform = detailTransform(detailRegion);
  const schoolImageSrc = assetPath(schoolImageBySlug[activeSchool.slug] ?? schoolImageBySlug["yonsei-university"]);
  const activeFacts = studyInfoFacts(activeSchool);

  function chooseRegion(region: RegionProfile) {
    const firstSchool = markers.find((marker) => marker.regionKey === region.key)?.school ?? activeSchool;
    setActiveRegionKey(region.key);
    setActiveSchoolSlug(firstSchool.slug);
    setHoveredSchoolSlug(null);
  }

  function chooseSchool(marker: SchoolMarker) {
    setActiveRegionKey(marker.regionKey);
    setActiveSchoolSlug(marker.school.slug);
  }

  return (
    <section className="bg-paper px-3 py-4 sm:px-6 sm:py-5 lg:px-8" aria-label="韩国留学地图">
      <div className="detail-page-container grid gap-3 rounded-[10px] border border-ink/40 bg-surface p-4 shadow-data">
        <div className="hidden">
          <h1 className="text-2xl font-black leading-none">从地图认识韩国大学</h1>
          <p className="text-sm font-bold leading-5 text-muted">先选地区，再看学校，快速找到适合你的留学目的地。</p>
          <span className="w-fit rounded-full border border-ink/40 bg-[#fff7dc] px-3 py-1.5 text-xs font-black">如何使用地图选校?</span>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          <article className="rounded-lg border border-ink/20 bg-[#fffaf0] p-3">
            <div className="hidden">
              <h2 className="inline-flex items-center gap-2 text-base font-black">
                <span className="grid size-5 place-items-center rounded-full border border-ink bg-surface text-xs">1</span>
                选择地区
              </h2>
              <span className="rounded-full border border-ink bg-paper px-2 py-1 text-xs font-black">
                {universities.length} 所学校
              </span>
            </div>

            <div className="relative h-96">
              <svg className="block h-full w-full rounded-lg border border-ink/25 bg-[#fff9ed]" viewBox="0 0 360 300" role="img" aria-label="韩国地区选择地图">
                <g transform="translate(74 0)">
                  {regions.map((region) => {
                    const isActive = region.key === activeRegionKey;
                    return (
                      <g
                        aria-label={`${region.name} 선택`}
                        className="group cursor-pointer focus:outline-none"
                        data-region={region.key}
                        key={region.key}
                        role="button"
                        tabIndex={0}
                        onClick={() => chooseRegion(region)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") chooseRegion(region);
                        }}
                        style={{ "--region-tone": region.tone } as React.CSSProperties}
                      >
                        {region.features.map((feature) => (
                          <path
                            className="transition-colors duration-150 group-hover:stroke-ink group-focus:stroke-ink"
                            d={feature.path}
                            key={feature.name}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={isActive ? 0.94 : 0.72}
                            style={{
                              fill: isActive ? region.tone : `color-mix(in srgb, ${region.tone} 46%, #fffefb)`,
                              stroke: isActive ? "rgba(10,10,10,.38)" : "rgba(10,10,10,.18)"
                            }}
                          />
                        ))}
                      </g>
                    );
                  })}
                  {activeMarker ? (
                    <g aria-hidden="true" className="pointer-events-none">
                      <path
                        d={`M ${activeMarker.x} ${activeMarker.y + 8.1} C ${activeMarker.x - 8.3} ${activeMarker.y} ${activeMarker.x - 7} ${
                          activeMarker.y - 9.7
                        } ${activeMarker.x} ${activeMarker.y - 9.7} C ${activeMarker.x + 7} ${activeMarker.y - 9.7} ${activeMarker.x + 8.3} ${
                          activeMarker.y
                        } ${activeMarker.x} ${activeMarker.y + 8.1} Z`}
                        fill="#b91c1c"
                        filter="drop-shadow(0 5px 7px rgba(10, 10, 10, 0.28))"
                        stroke="#7f1d1d"
                        strokeLinejoin="round"
                        strokeWidth={1.15}
                      />
                      <circle cx={activeMarker.x} cy={activeMarker.y - 3.7} fill="#fffefb" r={3.8} />
                    </g>
                  ) : null}
                </g>
                {regions.map((region) => (
                  <text
                    className="pointer-events-none select-none fill-ink text-[1rem] font-black"
                    key={`${region.key}-count`}
                    x={region.label.x}
                    y={region.label.y}
                    paintOrder="stroke"
                    stroke="#fffefb"
                    strokeWidth={3.5}
                    textAnchor="middle"
                    transform="translate(74 0)"
                  >
                    {counts[region.key]}
                  </text>
                ))}
              </svg>
              <div className="absolute bottom-3 left-3 top-3 z-10 flex w-28 flex-col gap-1.5 overflow-auto" aria-label="Region quick filters">
                {regions.map((region) => {
                  const isActive = region.key === activeRegionKey;
                  return (
                    <button
                      className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-ink/30 bg-paper/90 px-2 py-1 text-left text-xs font-black transition hover:translate-x-0.5 hover:bg-yellow focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                      key={`${region.key}-button`}
                      type="button"
                      onClick={() => chooseRegion(region)}
                    >
                      <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: region.tone }} aria-hidden="true" />
                      <span className={isActive ? "underline underline-offset-4" : undefined}>
                        {region.mapLabel} {counts[region.key]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </article>

          <article className="rounded-lg border border-ink/20 bg-[#fffaf0] p-3">
            <div className="hidden">
              <h2 className="inline-flex items-center gap-2 text-base font-black">
                <span className="grid size-5 place-items-center rounded-full border border-ink bg-surface text-xs">2</span>
                {activeRegion.mapLabel}
              </h2>
              <span className="min-w-0 truncate rounded-md border border-ink/55 bg-surface px-3 py-1.5 text-xs font-black" data-testid="selected-school-label">
                {markerPreviewSchool.nameCn}
              </span>
              <span className="rounded-full border border-ink px-3 py-1 text-xs font-black" style={{ backgroundColor: activeRegion.tone }}>
                {activeRegion.name}
              </span>
            </div>

            <svg className="block h-96 w-full rounded-lg border border-ink/25 bg-[#fff9ed]" viewBox="0 0 360 300" role="img" aria-label={`${activeRegion.name} 单独地图`}>
              <g transform={`translate(${transform.tx} ${transform.ty}) scale(${transform.scale})`}>
                {detailRegion.features.map((feature) => (
                  <path
                    d={feature.path}
                    fill={activeRegion.tone}
                    key={`${detailRegion.key}-${feature.name}-detail`}
                    stroke="#0a0a0a"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.45 / transform.scale}
                  />
                ))}
                {activeMarkers.map((marker, index) => {
                  const isActive = marker.school.slug === activeSchoolSlug;
                  const callout = detailMarkerCallout(marker, index, activeRegion);
                  const showCallout = activeRegionKey !== "seoul" && index < 6;
                  const markerSize = 5 / transform.scale;
                  const pinSize = 8.4 / transform.scale;
                  const pinPath = `M ${marker.x} ${marker.y + pinSize * 0.9} C ${marker.x - pinSize * 0.92} ${marker.y} ${marker.x - pinSize * 0.78} ${marker.y - pinSize * 1.08} ${marker.x} ${marker.y - pinSize * 1.08} C ${marker.x + pinSize * 0.78} ${marker.y - pinSize * 1.08} ${marker.x + pinSize * 0.92} ${marker.y} ${marker.x} ${marker.y + pinSize * 0.9} Z`;
                  const labelWidth = Math.max(34 / transform.scale, marker.school.nameCn.length * 8.6 / transform.scale);
                  const labelHeight = 15 / transform.scale;
                  const labelPad = 4 / transform.scale;
                  const labelCardX = callout.anchor === "start" ? callout.labelX - labelPad : callout.labelX - labelWidth + labelPad;
                  const labelCardY = callout.labelY - 11 / transform.scale;

                  return (
                    <g key={marker.school.slug}>
                      {showCallout ? (
                        <>
                          <line
                            className="pointer-events-none"
                            x1={marker.x}
                            y1={marker.y}
                            x2={callout.anchor === "start" ? callout.labelX - 4 / transform.scale : callout.labelX + 4 / transform.scale}
                            y2={callout.labelY - 2 / transform.scale}
                            stroke="rgba(10,10,10,.68)"
                            strokeLinecap="round"
                            strokeWidth={0.9 / transform.scale}
                          />
                          <rect
                            className="pointer-events-none"
                            fill="#fffefb"
                            height={labelHeight}
                            rx={2.5 / transform.scale}
                            stroke="#0a0a0a"
                            strokeWidth={0.9 / transform.scale}
                            width={labelWidth}
                            x={labelCardX}
                            y={labelCardY}
                          />
                          <text
                            className="pointer-events-none fill-ink font-black"
                            x={callout.labelX}
                            y={callout.labelY}
                            style={{ fontSize: `${7.4 / transform.scale}px` }}
                            textAnchor={callout.anchor}
                          >
                            {marker.school.nameCn}
                          </text>
                        </>
                      ) : null}
                      {isActive ? (
                        <>
                        <path
                          aria-label={`${marker.school.nameCn} 선택`}
                          className="cursor-pointer transition-transform hover:scale-110"
                          d={pinPath}
                          data-active="true"
                          data-testid="study-map-marker"
                          fill="#b91c1c"
                          role="button"
                          stroke="#7f1d1d"
                          strokeLinejoin="round"
                          strokeWidth={0.85 / transform.scale}
                          tabIndex={0}
                          onClick={() => chooseSchool(marker)}
                          onMouseEnter={() => setHoveredSchoolSlug(marker.school.slug)}
                          onMouseLeave={() => setHoveredSchoolSlug(null)}
                        />
                        <circle
                          className="pointer-events-none"
                          cx={marker.x}
                          cy={marker.y - pinSize * 0.32}
                          fill="#fffefb"
                          r={pinSize * 0.34}
                          stroke="#7f1d1d"
                          strokeWidth={0.18 / transform.scale}
                        />
                        </>
                      ) : (
                        <circle
                          aria-label={`${marker.school.nameCn} 선택`}
                          className="cursor-pointer transition-transform hover:scale-110"
                          cx={marker.x}
                          cy={marker.y}
                          data-active="false"
                          data-testid="study-map-marker"
                          fill="#8f57ef"
                          r={markerSize}
                          role="button"
                          stroke="#0a0a0a"
                          strokeWidth={0.85 / transform.scale}
                          tabIndex={0}
                          onClick={() => chooseSchool(marker)}
                          onMouseEnter={() => setHoveredSchoolSlug(marker.school.slug)}
                          onMouseLeave={() => setHoveredSchoolSlug(null)}
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>

            <div className="mt-3 flex max-h-20 flex-wrap gap-2 overflow-auto pr-1">
              {sortedActiveMarkers.map((marker) => (
                <button
                  className="rounded-full border border-ink bg-surface px-3 py-1.5 text-xs font-black transition hover:-translate-y-0.5 hover:bg-yellow focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                  key={marker.school.slug}
                  style={{ backgroundColor: activeSchoolSlug === marker.school.slug ? activeRegion.tone : "#fffefb" }}
                  type="button"
                  onClick={() => chooseSchool(marker)}
                >
                  {schoolMenuLabel(marker.school)}
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-lg border border-ink/20 bg-[#fffaf0] p-3">
            <div className="hidden">
              <h2 className="inline-flex items-center gap-2 text-base font-black">
                <span className="grid size-5 place-items-center rounded-full border border-ink bg-surface text-xs">3</span>
                学校速览
              </h2>
              <span className="rounded-full border border-ink bg-paper px-2 py-1 text-xs font-black">
                全部 {markers.length} 所
              </span>
            </div>

            <div className="grid grid-cols-[4.8rem_minmax(0,1fr)_auto] gap-3 rounded-lg border border-ink/15 bg-surface p-3 shadow-data">
              <Image
                className="size-[4.8rem] rounded-lg border border-ink/15 bg-surface object-cover p-0"
                src={schoolImageSrc}
                alt={`${activeSchool.nameCn} campus`}
                width={120}
                height={120}
                sizes="5rem"
              />
              <div className="min-w-0 space-y-[0.374rem]">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-2xl font-black leading-[1.188]">{activeSchool.nameCn}</h3>
                  <span className="border border-[#b6cda7] bg-[#eef8df] px-3 py-1 text-xs font-black leading-[1.1]">学校信息</span>
                </div>
                <p className="text-[0.83rem] font-normal italic leading-[1.375] text-muted">{schoolAddress(activeSchool)}</p>
                <p className="text-xs font-black leading-[1.1] text-muted">{activeSchool.nameKr} · {activeSchool.nameEn}</p>
              </div>
              <div className="flex flex-wrap justify-end gap-1.5">
                <span className="h-fit rounded-full border border-ink/10 bg-[#f5efe2] px-2 py-1 text-xs font-black leading-[1.1]">{schoolCityText(activeSchool)}</span>
                <span className={`h-fit rounded-full border px-2 py-1 text-xs font-black leading-[1.1] ${schoolTypeBadgeClass(activeSchool.type)}`}>{activeSchool.type}</span>
                <span className="h-fit rounded-full border border-ink/10 bg-[#eef3ff] px-2 py-1 text-xs font-black leading-[1.1]">{activeRegion.mapLabel}</span>
              </div>

              <div className="col-span-full overflow-hidden rounded-lg border border-ink/10 bg-surface">
                <div className="grid grid-cols-[7.225rem_minmax(0,1fr)] border-b border-ink/10 last:border-b-0">
                  <div className="bg-[#fffaf0] px-4 py-3 text-[0.79rem] font-bold">参考GPA分数</div>
                  <div className="px-4 py-3 text-[0.79rem] font-normal">{activeFacts.score}</div>
                </div>
                <div className="grid grid-cols-[7.225rem_minmax(0,1fr)] border-b border-ink/10">
                  <div className="bg-[#fffaf0] px-4 py-3 text-[0.79rem] font-bold">TOPIK要求</div>
                  <div className="px-4 py-3 text-[0.79rem] font-normal">{activeFacts.topik}</div>
                </div>
                <div className="grid grid-cols-[7.225rem_minmax(0,1fr)] border-b border-ink/10">
                  <div className="bg-[#fffaf0] px-4 py-3 text-[0.79rem] font-bold">学费范围</div>
                  <div className="px-4 py-3 text-[0.79rem] font-normal">{activeFacts.tuition}</div>
                </div>
                <div className="grid grid-cols-[7.225rem_minmax(0,1fr)]">
                  <div className="bg-[#fffaf0] px-4 py-3 text-[0.79rem] font-bold">热门专业</div>
                  <div className="px-4 py-3 text-[0.79rem] font-normal">{activeFacts.tags.join("、")}</div>
                </div>
              </div>

              <a className="col-span-full inline-flex min-h-9 items-center justify-center rounded-lg border border-ink/35 bg-yellow text-sm font-black text-ink no-underline" href="/universities">
                报考详情 →
              </a>
              </div>
          </article>
        </div>
      </div>
    </section>
  );
}
